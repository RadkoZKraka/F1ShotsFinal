using F1Shots.Models;
using F1Shots.Storage;
using MongoDB.Bson;

namespace F1Shots.Services
{
    public class CommonService
    {
        private readonly UserStorage _userStorage;
        private readonly GroupStorage _groupStorage;
        private readonly NotificationStorage _notificationStorage;
        private readonly UserRelationsStorage _userRelationsStorage;
        private readonly GroupRelationsStorage _groupRelationsStorage;

        public CommonService(UserStorage userStorage, GroupStorage groupStorage,
            NotificationStorage notificationStorage, UserRelationsStorage userRelationsStorage,
            GroupRelationsStorage groupRelationsStorage)
        {
            _userStorage = userStorage;
            _groupStorage = groupStorage;
            _notificationStorage = notificationStorage;
            _userRelationsStorage = userRelationsStorage;
            _groupRelationsStorage = groupRelationsStorage;
        }

        public async Task AddFriendAsync(ObjectId userId, ObjectId requestFriendId)
        {
            var existingRequest = await _userRelationsStorage.GetFriendshipByIdAsync(userId, requestFriendId);

            if (existingRequest?.Status == UserRelationStatus.Banned)
            {
                throw new InvalidOperationException("You are banned.");
            }

            if (existingRequest == null || existingRequest.Status == UserRelationStatus.None ||
                existingRequest.Status == UserRelationStatus.Rejected)
            {
                if (existingRequest == null)
                {
                    var friendRequest = new UserRelation
                    {
                        InitiationUserId = userId,
                        RecipientUserId = requestFriendId,
                        Status = UserRelationStatus.Pending,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _userRelationsStorage.AddFriendshipAsync(friendRequest);
                    var user1 = await _userStorage.GetUserByIdAsync(userId);

                    var notification1 = new Notification
                    {
                        Guid = Guid.NewGuid(),
                        UserId = requestFriendId, // Who is the recipient
                        SenderUserId = user1.Id, // Who sent the notification
                        Message = $"{user1.Username} has sent you a friend request.",
                        Type = NotificationType.FriendRequest,
                        Status = NotificationStatus.Unread,
                        Responded = false,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _notificationStorage.AddNotificationAsync(notification1);

                    return;
                }

                existingRequest.Status = UserRelationStatus.Pending;
                existingRequest.InitiationUserId = userId;
                existingRequest.RecipientUserId = requestFriendId;

                var user = await _userStorage.GetUserByIdAsync(userId);

                var notification = new Notification
                {
                    Guid = Guid.NewGuid(),
                    UserId = requestFriendId, // Who is the recipient
                    SenderUserId = user.Id, // Who sent the notification
                    Message = $"{user.Username} has sent you a friend request.",
                    Responded = false,
                    Type = NotificationType.FriendRequest,
                    Status = NotificationStatus.Unread,
                    CreatedAt = DateTime.UtcNow
                };

                await _notificationStorage.AddNotificationAsync(notification);

                await _userRelationsStorage.UpdateFriendshipAsync(existingRequest);
            }
            else if (existingRequest.Status == UserRelationStatus.Pending)
            {
                throw new InvalidOperationException("Friend request already sent.");
            }
            else if (existingRequest.Status == UserRelationStatus.Accepted)
            {
                throw new InvalidOperationException("You are already friends.");
            }
            else
            {
                throw new InvalidOperationException("Cannot add friend due to an existing conflicting status.");
            }
        }


        public async Task<bool> ConfirmFriendRequestAsync(ObjectId userId, ObjectId requestFriendId)
        {
            var friendship = await _userRelationsStorage.GetFriendshipByIdAsync(requestFriendId, userId);
            if (friendship == null || friendship.Status != UserRelationStatus.Pending)
            {
                throw new InvalidOperationException("Friendship request does not exist or has already been confirmed.");
            }

            friendship.Status = UserRelationStatus.Accepted;
            await _userRelationsStorage.UpdateFriendshipAsync(friendship);

            var notification =
                await _notificationStorage.GetFriendRequestByUsernames(friendship.InitiationUserId.ToString(),
                    friendship.RecipientUserId.ToString());

            if (notification != null)
            {
                notification.Status = NotificationStatus.Read;
                notification.Responded = true;
                await _notificationStorage.UpdateNotificationAsync(notification);
            }

            var user = await _userStorage.GetUserByIdAsync(userId);

            var newNotification = new Notification
            {
                Guid = Guid.NewGuid(),
                UserId = notification.SenderUserId, // Who is the recipient
                SenderUserId = userId,
                GroupId = ObjectId.Empty,
                Message = $"Your friend invite of {user.Username} has been confirmed.",
                Type = NotificationType.Info,
                Status = NotificationStatus.Unread,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationStorage.AddNotificationAsync(newNotification);

            return true;
        }

        public async Task<bool> RejectFriendRequestAsync(ObjectId userId, ObjectId requestFriendId)
        {
            var friendship = await _userRelationsStorage.GetFriendshipByIdAsync(userId, requestFriendId);
            if (friendship == null || friendship.Status != UserRelationStatus.Pending)
            {
                throw new InvalidOperationException("Friendship request does not exist or has already been processed.");
            }

            friendship.Status = UserRelationStatus.Rejected;
            await _userRelationsStorage.UpdateFriendshipAsync(friendship);


            var notification =
                await _notificationStorage.GetFriendRequestByUsernames(friendship.InitiationUserId.ToString(),
                    friendship.RecipientUserId.ToString());

            if (notification != null)
            {
                notification.Status = NotificationStatus.Read;
                notification.Responded = true;
                await _notificationStorage.UpdateNotificationAsync(notification);
            }

            var user = await _userStorage.GetUserByIdAsync(userId);

            var newNotification = new Notification
            {
                Guid = Guid.NewGuid(),
                UserId = notification.SenderUserId, // Who is the recipient
                SenderUserId = userId,
                GroupId = ObjectId.Empty,
                Message = $"Your friend invite of {user.Username} has been rejected.",
                Type = NotificationType.Info,
                Status = NotificationStatus.Unread,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationStorage.AddNotificationAsync(newNotification);

            return true;
        }

        public async Task<Group?> InviteUserToGroupAsync(ObjectId groupId, ObjectId userToBeInvitedId,
            ObjectId userInvitingId)
        {
            var group = await _groupStorage.GetGroupByIdAsync(groupId);
            if (group == null)
            {
                throw new InvalidOperationException("Group does not exist.");
            }

            var existingRequest = await _groupRelationsStorage.GetGroupRelationByIdAsync(userToBeInvitedId, groupId);

            if (existingRequest == null || existingRequest.Status == GroupRelationStatus.None ||
                existingRequest.Status == GroupRelationStatus.JoinRejected)
            {
                if (existingRequest == null)
                {
                    var groupRequest = new GroupRelation
                    {
                        UserToBeInvitedId = userToBeInvitedId,
                        GroupId = groupId,
                        Status = GroupRelationStatus.InvitePending,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _groupRelationsStorage.AddGroupRelationAsync(groupRequest);

                    var notification1 = new Notification
                    {
                        Guid = Guid.NewGuid(),
                        UserId = userToBeInvitedId, // Who is the recipient
                        SenderUserId = userInvitingId, // Who sent the notification
                        GroupId = groupId,
                        Message = $"You have been invited to join {group.Name}.",
                        Responded = false,
                        Type = NotificationType.GroupInviteRequest,
                        Status = NotificationStatus.Unread,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _notificationStorage.AddNotificationAsync(notification1);


                    return group;
                }


                existingRequest.Status = GroupRelationStatus.InvitePending;
                existingRequest.UserToBeInvitedId = userToBeInvitedId;
                existingRequest.GroupId = groupId;

                var user = await _userStorage.GetUserByIdAsync(userInvitingId);

                var notification = new Notification
                {
                    Guid = Guid.NewGuid(),
                    UserId = userToBeInvitedId, // Who is the recipient
                    SenderUserId = userInvitingId, // Who sent the notification
                    GroupId = group.Id,
                    Message = $"{user.Username} has sent you a group invite to:  {group.Name}.",
                    Responded = false,
                    Type = NotificationType.GroupInviteRequest,
                    Status = NotificationStatus.Unread,
                    CreatedAt = DateTime.UtcNow
                };

                await _notificationStorage.AddNotificationAsync(notification);

                await _groupRelationsStorage.UpdateGroupRelationAsync(existingRequest);
            }


            else if (existingRequest.Status == GroupRelationStatus.Banned)
            {
                throw new InvalidOperationException("User is banned from that group.");
            }
            else if (existingRequest.Status == GroupRelationStatus.GroupBanned)
            {
                throw new InvalidOperationException("User banned.");
            }
            else if (existingRequest.Status == GroupRelationStatus.Accepted)
            {
                throw new InvalidOperationException("User already in that group.");
            }
            else
            {
                throw new InvalidOperationException("Cannot invite user due to an existing conflicting status.");
            }


            return group;
        }

        public async Task ConfirmGroupInviteAsync(ObjectId userId, ObjectId groupId, Guid notificationGuid)
        {
            var groupRelation = await _groupRelationsStorage.GetGroupRelationByIdAsync(userId, groupId);
            if (groupRelation == null || groupRelation.Status != GroupRelationStatus.InvitePending)
            {
                throw new InvalidOperationException(
                    "Group invitation does not exist or has already been processed.");
            }

            groupRelation.Status = GroupRelationStatus.Accepted;
            await _groupRelationsStorage.UpdateGroupRelationAsync(groupRelation);

            var group = await _groupStorage.GetGroupByIdAsync(groupId);

            group.PlayersIds.Add(userId);
            group.PlayersUserNames.Add(await _userStorage.GetUsernameByIdAsync(userId));

            await _groupStorage.UpdateGroupAsync(group);

            var notifications = await _notificationStorage.GetNotificationsByGuidAsync(notificationGuid);
            foreach (var notification in notifications)
            {
                if (notification != null)
                {
                    notification.Status = NotificationStatus.Read;
                    notification.Responded = true;
                    await _notificationStorage.UpdateNotificationAsync(notification);
                }
            }

            var user = await _userStorage.GetUserByIdAsync(userId);

            var newNotification = new Notification
            {
                Guid = Guid.NewGuid(),
                UserId = notifications.First().SenderUserId, // Who is the recipient
                SenderUserId = userId,
                GroupId = groupId,
                Message = $"Your group invitation to {user.Username} has been confirmed.",
                Type = NotificationType.Info,
                Status = NotificationStatus.Unread,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationStorage.AddNotificationAsync(newNotification);
        }

        public async Task RejectGroupInviteAsync(ObjectId userId, ObjectId groupId, Guid notificationGuid)
        {
            var groupRelation = await _groupRelationsStorage.GetGroupRelationByIdAsync(userId, groupId);
            if (groupRelation == null || groupRelation.Status != GroupRelationStatus.InvitePending)
            {
                throw new InvalidOperationException(
                    "Group invitation does not exist or has already been processed.");
            }

            groupRelation.Status = GroupRelationStatus.InviteRejected;
            await _groupRelationsStorage.UpdateGroupRelationAsync(groupRelation);

            var notifications = await _notificationStorage.GetNotificationsByGuidAsync(notificationGuid);
            foreach (var notification in notifications)
            {
                if (notification != null)
                {
                    notification.Status = NotificationStatus.Read;
                    notification.Responded = true;
                    await _notificationStorage.UpdateNotificationAsync(notification);
                }
            }

            var user = await _userStorage.GetUserByIdAsync(userId);

            var newNotification = new Notification
            {
                Guid = Guid.NewGuid(),
                UserId = notifications.First().SenderUserId, // Who is the recipient
                SenderUserId = userId,
                GroupId = groupId,
                Message = $"Your group invitation to {user.Username} has been rejected.",
                Type = NotificationType.Info,
                Status = NotificationStatus.Unread,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationStorage.AddNotificationAsync(newNotification);
        }

        public async Task<Group?> JoinAGroupRequestAsync(ObjectId userId, ObjectId groupId)
        {
            var group = await _groupStorage.GetGroupByIdAsync(groupId);
            if (group == null)
            {
                throw new InvalidOperationException("Group does not exist.");
            }

            var existingRequest = await _groupRelationsStorage.GetGroupRelationByIdAsync(userId, groupId);

            if (existingRequest == null || existingRequest.Status == GroupRelationStatus.None ||
                existingRequest.Status == GroupRelationStatus.InviteRejected)
            {
                if (existingRequest == null)
                {
                    var groupRequest = new GroupRelation
                    {
                        UserRequestingJoinId = userId,
                        GroupId = groupId,
                        Status = GroupRelationStatus.InvitePending,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _groupRelationsStorage.AddGroupRelationAsync(groupRequest);
                    var guid1 = Guid.NewGuid();
                    foreach (var adminUserId in group.AdminUserIds)
                    {
                        var notification1 = new Notification
                        {
                            Guid = guid1,
                            UserId = adminUserId, // Who is the recipient
                            SenderUserId = userId, // Who sent the notification
                            GroupId = groupId,
                            Message = $"You have been invited to join {group.Name}.",
                            Responded = false,
                            Type = NotificationType.GroupInviteRequest,
                            Status = NotificationStatus.Unread,
                            CreatedAt = DateTime.UtcNow
                        };

                        await _notificationStorage.AddNotificationAsync(notification1);
                    }

                    return group;
                }


                existingRequest.Status = GroupRelationStatus.InvitePending;
                existingRequest.UserToBeInvitedId = userId;
                existingRequest.GroupId = groupId;

                var user = await _userStorage.GetUserByIdAsync(userId);
                var guid = Guid.NewGuid();

                foreach (var adminUserId in group.AdminUserIds)
                {
                    var notification = new Notification
                    {
                        Guid = guid,
                        UserId = adminUserId, // Who is the recipient
                        SenderUserId = userId, // Who sent the notification
                        Message = $"{user.Username} requests to join:  {group.Name}.",
                        Responded = false,
                        Type = NotificationType.GroupJoinRequest,
                        Status = NotificationStatus.Unread,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _notificationStorage.AddNotificationAsync(notification);
                }

                await _groupRelationsStorage.UpdateGroupRelationAsync(existingRequest);
            }
            else if (existingRequest.Status == GroupRelationStatus.JoinPending)
            {
                throw new InvalidOperationException("Group invite already sent.");
            }
            else if (existingRequest.Status == GroupRelationStatus.InvitePending)
            {
                throw new InvalidOperationException("You are already invited to that group.");
            }
            else if (existingRequest.Status == GroupRelationStatus.Banned)
            {
                throw new InvalidOperationException("You are banned from that group.");
            }
            else if (existingRequest.Status == GroupRelationStatus.GroupBanned)
            {
                throw new InvalidOperationException("You banned that group.");
            }
            else if (existingRequest.Status == GroupRelationStatus.Accepted)
            {
                throw new InvalidOperationException("You are already in that group.");
            }
            else
            {
                throw new InvalidOperationException("Cannot invite user due to an existing conflicting status.");
            }


            return group;
        }

        public async Task ConfirmGroupJoinRequestAsync(ObjectId userConfirmingId, ObjectId userToBeConfirmedId,
            ObjectId groupId, Guid notificationGuid)
        {
            var groupRelation = await _groupRelationsStorage.GetGroupRelationByIdAsync(userToBeConfirmedId, groupId);
            if (groupRelation == null || groupRelation.Status != GroupRelationStatus.JoinPending)
            {
                throw new InvalidOperationException(
                    "Group join request does not exist or has already been processed.");
            }

            groupRelation.Status = GroupRelationStatus.Accepted;
            await _groupRelationsStorage.UpdateGroupRelationAsync(groupRelation);

            var notifications = await _notificationStorage.GetNotificationsByGuidAsync(notificationGuid);
            foreach (var notification in notifications)
            {
                if (notification != null)
                {
                    notification.Status = NotificationStatus.Read;
                    notification.Responded = true;
                    await _notificationStorage.UpdateNotificationAsync(notification);
                }
            }

            var group = await _groupStorage.GetGroupByIdAsync(groupId);

            group.PlayersUserNames.Add(await _userStorage.GetUsernameByIdAsync(userToBeConfirmedId));
            group.PlayersIds.Add(userToBeConfirmedId);
            await _groupStorage.UpdateGroupAsync(group);

            var newNotification = new Notification
            {
                Guid = Guid.NewGuid(),
                UserId = userToBeConfirmedId, // Who is the recipient
                SenderUserId = userConfirmingId,
                GroupId = ObjectId.Empty,
                Message = $"Your group join request to {group.Name} has been confirmed.",
                Type = NotificationType.Info,
                Status = NotificationStatus.Unread,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationStorage.AddNotificationAsync(newNotification);
        }

        public async Task RejectGroupJoinRequestAsync(ObjectId userRejectingId, ObjectId userToBeRejectedId,
            ObjectId groupId, Guid notificationGuid)
        {
            var groupRelation = await _groupRelationsStorage.GetGroupRelationByIdAsync(userToBeRejectedId, groupId);
            if (groupRelation == null || groupRelation.Status != GroupRelationStatus.JoinPending)
            {
                throw new InvalidOperationException(
                    "Group join request does not exist or has already been processed.");
            }

            groupRelation.Status = GroupRelationStatus.JoinRejected;
            await _groupRelationsStorage.UpdateGroupRelationAsync(groupRelation);

            var notifications = await _notificationStorage.GetNotificationsByGuidAsync(notificationGuid);
            foreach (var notification in notifications)
            {
                if (notification != null)
                {
                    notification.Status = NotificationStatus.Read;
                    notification.Responded = true;
                    await _notificationStorage.UpdateNotificationAsync(notification);
                }
            }

            var group = await _groupStorage.GetGroupByIdAsync(groupId);

            var newNotification = new Notification
            {
                Guid = Guid.NewGuid(),
                UserId = userToBeRejectedId, // Who is the recipient
                SenderUserId = userRejectingId,
                GroupId = ObjectId.Empty,
                Message = $"Your group join request to {group.Name} has been rejected.",
                Type = NotificationType.Info,
                Status = NotificationStatus.Unread,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationStorage.AddNotificationAsync(newNotification);
        }

        public async Task<List<UserProfile>> GetUsersInvitedToGroupAsync(ObjectId groupObjectId)
        {
            // Get all group relations for the specified group with status 'Pending'
            var groupRelations =
                await _groupRelationsStorage.GetGroupRelationsByGroupIdAndStatusAsync(groupObjectId,
                    GroupRelationStatus.InvitePending);

            if (groupRelations == null || !groupRelations.Any())
            {
                return new List<UserProfile>();
            }

            // Retrieve user profiles for each user invited to the group
            var userProfiles = new List<UserProfile>();
            foreach (var relation in groupRelations)
            {
                var userProfile = await _userStorage.GetUserByIdAsync(relation.UserToBeInvitedId);
                if (userProfile != null)
                {
                    userProfiles.Add(userProfile);
                }
            }

            return userProfiles;
        }

        public bool CheckIfUserIsInvitedToGroup(string userIdString, ObjectId groupId)
        {
            if (!ObjectId.TryParse(userIdString, out ObjectId userId))
            {
                throw new InvalidOperationException("Invalid user ID.");
            }

            var groupRelation = _groupRelationsStorage.CheckIfUserIsInvitedToGroup(userIdString, groupId);
            return groupRelation;
        }

        public async void UpdateGroupInNotificationsAsync(Group updatedGroup)
        {
            _notificationStorage.UpdateGroupInNotificationsAsync(updatedGroup);
        }

        public async void UpdateUsernameInNotificationsAsync(ObjectId userId, string updatedUsername)
        {
            _notificationStorage.UpdateUsernameInNotificationsAsync(userId, updatedUsername);
        }

        public async Task<Notification> GetFriendRequestNotificationAsync(ObjectId userId, ObjectId visitingUserId)
        {
            return await _notificationStorage.GetFriendRequestByUsernames(userId.ToString(),
                visitingUserId.ToString());
        }

        public async Task<Notification> GetNotificationByGroupIdAndUserId(ObjectId userId, ObjectId groupId)
        {
            return await _notificationStorage.GetNotificationByGroupIdAndUserId(userId, groupId);
        }

        public async Task<List<UserProfile>> GetValidProfilesAsync(ObjectId userId,
            List<UserProfile> publicProfiles)
        {
            var validProfiles = new List<UserProfile>();
            foreach (var profile in publicProfiles)
            {
                var friendship = await _userRelationsStorage.GetFriendshipByIdAsync(userId, profile.Id);
                if (friendship == null || friendship.Status != UserRelationStatus.Banned)
                {
                    validProfiles.Add(profile);
                }
            }

            return validProfiles;
        }

        public async Task<List<UserProfile>> GetBannedUsersAsync(ObjectId userId)
        {
            var bannedUsers = await _userRelationsStorage.GetBannedUsersAsync(userId);
            var bannedUserProfiles = new List<UserProfile>();
            foreach (var user in bannedUsers)
            {
                var userProfile = await _userStorage.GetUserByIdAsync(user.RecipientUserId);
                if (userProfile != null)
                {
                    bannedUserProfiles.Add(userProfile);
                }
            }

            return bannedUserProfiles;
        }

        public async Task CancelFriendRequestAsync(ObjectId userId, ObjectId friendUserId)
        {
            var friendship = await _userRelationsStorage.GetFriendshipByIdAsync(userId, friendUserId);
            if (friendship == null || friendship.Status != UserRelationStatus.Pending)
            {
                throw new InvalidOperationException(
                    "Friendship request does not exist or has already been processed.");
            }

            friendship.Status = UserRelationStatus.None;

            var notification =
                await _notificationStorage.GetFriendRequestByUsernames(friendship.InitiationUserId.ToString(),
                    friendship.RecipientUserId.ToString());

            await _notificationStorage.DeleteNotificationAsync(notification.Id);

            await _userRelationsStorage.UpdateFriendshipAsync(friendship);
        }

        public async Task<GroupRelation> GetGroupRelation(ObjectId userId, ObjectId groupId)
        {
            return await _groupRelationsStorage.GetGroupRelation(userId, groupId);
        }

        public async Task RequestJoinGroupAsync(ObjectId groupId, ObjectId userId)
        {
            var existingRequest = await _groupRelationsStorage.GetGroupRelationByIdAsync(userId, groupId);

            if (existingRequest != null)
            {
                existingRequest.Status = GroupRelationStatus.JoinPending;
                var group1 = await _groupStorage.GetGroupByIdAsync(groupId);
                var user1 = await _userStorage.GetUserByIdAsync(userId);

                var guid1 = Guid.NewGuid();

                await _groupRelationsStorage.UpdateGroupRelationAsync(existingRequest);

                foreach (var adminUserId in group1.AdminUserIds)
                {
                    var notification = new Notification
                    {
                        Guid = guid1,
                        UserId = adminUserId, // Who is the recipient
                        SenderUserId = userId, // Who sent the notification
                        GroupId = groupId,
                        Message = $"{user1.Username} has sent a request to join {group1.Name}.",
                        Responded = false,
                        Type = NotificationType.GroupJoinRequest,
                        Status = NotificationStatus.Unread,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _notificationStorage.AddNotificationAsync(notification);
                }

                return;
            }

            var groupRequest = new GroupRelation
            {
                UserToBeInvitedId = userId,
                GroupId = groupId,
                Status = GroupRelationStatus.JoinPending,
                CreatedAt = DateTime.UtcNow
            };

            await _groupRelationsStorage.AddGroupRelationAsync(groupRequest);
            var group = await _groupStorage.GetGroupByIdAsync(groupId);
            var user = await _userStorage.GetUserByIdAsync(userId);

            var guid = Guid.NewGuid();

            foreach (var adminUserId in group.AdminUserIds)
            {
                var notification = new Notification
                {
                    Guid = guid,
                    UserId = adminUserId, // Who is the recipient
                    SenderUserId = userId, // Who sent the notification
                    GroupId = groupId,
                    Message = $"{user.Username} has sent a request to join {group.Name}.",
                    Responded = false,
                    Type = NotificationType.GroupJoinRequest,
                    Status = NotificationStatus.Unread,
                    CreatedAt = DateTime.UtcNow
                };

                await _notificationStorage.AddNotificationAsync(notification);
            }
        }

        public async Task<List<GroupRelation>> GetGroupRelationsByGroupIdAsync(ObjectId groupId)
        {
            return await _groupRelationsStorage.GetGroupRelationsByGroupIdAsync(groupId);
        }

        public async Task RemovePlayerFromGroupAsync(ObjectId groupObjectId, ObjectId playerObjectId)
        {
            var group = await _groupStorage.GetGroupByIdAsync(groupObjectId);

            group.PlayersIds.Remove(playerObjectId);
            group.AdminUserIds.Remove(playerObjectId);
            group.PlayersUserNames.Remove(await _userStorage.GetUsernameByIdAsync(playerObjectId));
            
            var groupRelation = await _groupRelationsStorage.GetGroupRelation(playerObjectId, groupObjectId);
            if (groupRelation == null)
            {
                throw new Exception("Group relation cannot be found.");
            }
            
            groupRelation.Status = GroupRelationStatus.None;
            
            await _groupRelationsStorage.UpdateGroupRelationAsync(groupRelation);
            await _groupStorage.UpdateGroupAsync(group);

            var guid = Guid.NewGuid();

            var notification = new Notification
            {
                Guid = guid,
                UserId = playerObjectId, // Who is the recipient
                SenderUserId = ObjectId.Empty, // Who sent the notification
                GroupId = groupObjectId,
                Message = $"You have been removed from {group.Name}.",
                Type = NotificationType.Info,
                Status = NotificationStatus.Unread,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationStorage.AddNotificationAsync(notification);
        }

        public async Task BanUserFromGroupAsync(ObjectId userId, ObjectId groupId)
        {
            var groupRelation = await _groupRelationsStorage.GetGroupRelation(userId, groupId);
            var group = await _groupStorage.GetGroupByIdAsync(groupId);

            if (groupRelation == null)
            {
                if (group.PlayersIds.Contains(userId))
                {
                    group.PlayersIds.Remove(userId);
                    group.PlayersUserNames.Remove(await _userStorage.GetUsernameByIdAsync(userId));
                }

                // Check if the user is in the group admins list
                if (group.AdminUserIds.Contains(userId))
                {
                    group.AdminUserIds.Remove(userId);
                }

                // Update the group if any removal occurred
                await _groupStorage.UpdateGroupAsync(group);

                var relation = new GroupRelation
                {
                    UserToBeInvitedId = userId,
                    GroupId = groupId,
                    Status = GroupRelationStatus.Banned,
                    CreatedAt = DateTime.UtcNow
                };
                await _groupRelationsStorage.AddGroupRelationAsync(relation);

                var notification2 = new Notification
                {
                    Guid = Guid.NewGuid(),
                    UserId = userId, // Who is the recipient
                    SenderUserId = ObjectId.Empty, // Who sent the notification
                    GroupId = groupId,
                    Message = $"You have been banned from {group.Name}.",
                    Type = NotificationType.Info,
                    Status = NotificationStatus.Unread,
                    CreatedAt = DateTime.UtcNow
                };
                await _notificationStorage.AddNotificationAsync(notification2);
                return;
            }

            if (groupRelation.Status == GroupRelationStatus.GroupBanned)
            {
                return;
            }

            groupRelation.Status = GroupRelationStatus.Banned;
            await _groupRelationsStorage.UpdateGroupRelationAsync(groupRelation);


            var notification = new Notification
            {
                Guid = Guid.NewGuid(),
                UserId = userId, // Who is the recipient
                SenderUserId = ObjectId.Empty, // Who sent the notification
                GroupId = groupId,
                Message = $"You have been banned from {group.Name}.",
                Type = NotificationType.Info,
                Status = NotificationStatus.Unread,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationStorage.AddNotificationAsync(notification);
        }

        public async Task<List<UserProfile>> GetBannedUsersByGroupIdAsync(ObjectId groupId)
        {
            var groupRelations = await _groupRelationsStorage.GetGroupRelationsByGroupIdAndStatusAsync(groupId,
                GroupRelationStatus.Banned);

            var bannedUsers = new List<UserProfile>();
            foreach (var relation in groupRelations)
            {
                var userProfile = await _userStorage.GetUserByIdAsync(relation.UserToBeInvitedId);
                if (userProfile != null)
                {
                    bannedUsers.Add(userProfile);
                }
            }

            return bannedUsers;
        }

        public async Task UnbanUserFromGroupAsync(ObjectId userId, ObjectId groupId)
        {
            var groupRelation = await _groupRelationsStorage.GetGroupRelation(userId, groupId);
            if (groupRelation == null || groupRelation.Status != GroupRelationStatus.Banned)
            {
                return;
            }

            groupRelation.Status = GroupRelationStatus.None;
            await _groupRelationsStorage.UpdateGroupRelationAsync(groupRelation);

            var group = await _groupStorage.GetGroupByIdAsync(groupId);

            var notification = new Notification
            {
                Guid = Guid.NewGuid(),
                UserId = userId, // Who is the recipient
                SenderUserId = ObjectId.Empty, // Who sent the notification
                GroupId = groupId,
                Message = $"You have been unbanned from {group.Name}.",
                Type = NotificationType.Info,
                Status = NotificationStatus.Unread,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationStorage.AddNotificationAsync(notification);
        }

        public async Task CancelGroupRequestAsync(ObjectId userId, ObjectId groupId)
        {
            var groupRelation = await _groupRelationsStorage.GetGroupRelation(userId, groupId);

            if (groupRelation == null || groupRelation.Status != GroupRelationStatus.InvitePending)
            {
                throw new InvalidOperationException(
                    "Friendship request does not exist or has already been processed.");
            }

            groupRelation.Status = GroupRelationStatus.None;

            var notification =
                await _notificationStorage.GetGroupInviteByGroupIdAndUserIdAsync(groupRelation.GroupId,
                    groupRelation.UserToBeInvitedId);

            await _notificationStorage.DeleteNotificationAsync(notification.Id);

            await _groupRelationsStorage.UpdateGroupRelationAsync(groupRelation);
        }
        
        public async Task CancelGroupJoinRequestAsync(ObjectId userId, ObjectId groupId)
        {
            var groupRelation = await _groupRelationsStorage.GetGroupRelation(userId, groupId);

            if (groupRelation == null || groupRelation.Status != GroupRelationStatus.JoinPending)
            {
                throw new InvalidOperationException(
                    "Group Join request doesnt exist.");
            }

            groupRelation.Status = GroupRelationStatus.None;

            var notifications =
                await _notificationStorage.GetGroupJoinRequestByGroupIdAndUserIdAsync(groupRelation.GroupId,
                    groupRelation.UserToBeInvitedId);

            foreach (var notification in notifications)
            {
                await _notificationStorage.DeleteNotificationAsync(notification.Id);
            }

            await _groupRelationsStorage.UpdateGroupRelationAsync(groupRelation);
        }

        public async Task BanGroupAsync(ObjectId groupId, ObjectId userId)
        {
            var groupRelation = await _groupRelationsStorage.GetGroupRelation(userId, groupId);

            if (groupRelation == null)
            {
                var newRelation = new GroupRelation
                {
                    UserToBeInvitedId = userId,
                    GroupId = groupId,
                    Status = GroupRelationStatus.GroupBanned,
                    CreatedAt = DateTime.UtcNow
                };
                await _groupRelationsStorage.AddGroupRelationAsync(newRelation);

                return;
            }
            groupRelation.Status = GroupRelationStatus.GroupBanned;
            await _groupRelationsStorage.UpdateGroupRelationAsync(groupRelation);

            var group = await _groupStorage.GetGroupByIdAsync(groupId);

            if (group.PlayersIds.Contains(userId))
            {
                group.PlayersIds.Remove(userId);
                group.PlayersUserNames.Remove(await _userStorage.GetUsernameByIdAsync(userId));
            }

            // Check if the user is in the group admins list
            if (group.AdminUserIds.Contains(userId))
            {
                group.AdminUserIds.Remove(userId);
            }

            // Update the group if any removal occurred
            await _groupStorage.UpdateGroupAsync(group);
        }

        public async Task LeaveGroupAsync(ObjectId groupId, ObjectId userId)
        {
            var group = await _groupStorage.GetGroupByIdAsync(groupId);
            group.PlayersIds.Remove(userId);
            group.PlayersUserNames.Remove(await _userStorage.GetUsernameByIdAsync(userId));

            if (group.AdminUserIds.Contains(userId))
            {
                group.AdminUserIds.Remove(userId);
            }

            var groupRelation = await _groupRelationsStorage.GetGroupRelation(userId, groupId);
            var user = await _userStorage.GetUserByIdAsync(userId);
            if (groupRelation != null)
            {
                groupRelation.Status = GroupRelationStatus.None;
                await _groupRelationsStorage.UpdateGroupRelationAsync(groupRelation);
            }

            var guid = Guid.NewGuid();

            foreach (var playerId in group.PlayersIds)
            {
                var notification = new Notification
                {
                    Guid = guid,
                    UserId = playerId, // Who is the recipient
                    SenderUserId = ObjectId.Empty, // Who sent the notification
                    GroupId = groupId,
                    Message = $"{user.Username} has left {group.Name}.",
                    Type = NotificationType.Info,
                    Status = NotificationStatus.Unread,
                    CreatedAt = DateTime.UtcNow
                };
                await _notificationStorage.AddNotificationAsync(notification);
            }

            await _groupStorage.UpdateGroupAsync(group);
        }

        public async Task<List<Group>> GetBannedGroupsByUserIdAsync(ObjectId userId)
        {
            var groupRelations = await _groupRelationsStorage.GetGroupRelationsByUserIdAndStatusAsync(userId,
                GroupRelationStatus.GroupBanned);

            if (groupRelations == null)
            {
                return new List<Group>();
            }
            var bannedGroups = new List<Group>();
            foreach (var relation in groupRelations)
            {
                var group = await _groupStorage.GetGroupByIdAsync(relation.GroupId);
                if (group != null)
                {
                    bannedGroups.Add(group);
                }
            }

            return bannedGroups;
        }

        public async Task UnbanGroupAsync(ObjectId groupId, ObjectId userId)
        {
            var groupRelation = await _groupRelationsStorage.GetGroupRelation(userId, groupId);
            if (groupRelation == null || groupRelation.Status != GroupRelationStatus.GroupBanned)
            {
                return;
            }

            groupRelation.Status = GroupRelationStatus.None;
            await _groupRelationsStorage.UpdateGroupRelationAsync(groupRelation);
        }

        public async Task<List<object>> GetRequests(ObjectId userId)
        {
            // Fetch pending group join requests and pending friend requests
            var groupRelations = await _groupRelationsStorage.GetGroupRelationsByUserIdAndStatusAsync(userId, GroupRelationStatus.JoinPending);
            var userRelations = await _userRelationsStorage.GetUserRelationsByUserIdAndStatusAsync(userId, UserRelationStatus.Pending);
    
            // Create a list to hold all the requests in an anonymous class format
            var requests = new List<object>();

            // Process group relations and add them to the list
            foreach (var groupRelation in groupRelations)
            {
                var groupRequest = new 
                {
                    Type = "Group",
                    GroupId = groupRelation.GroupId.ToString(),
                    GroupName = _groupStorage.GetGroupByIdAsync(groupRelation.GroupId).Result.Name,
                };
                requests.Add(groupRequest);
            }

            // Process user relations and add them to the list
            foreach (var userRelation in userRelations)
            {
                var userRequest = new 
                {
                    Type = "User",
                    RecipientUserId = userRelation.RecipientUserId.ToString(),
                    UserName = _userStorage.GetUserByIdAsync(userRelation.RecipientUserId).Result.Username
                };
                requests.Add(userRequest);
            }

            return requests;
        }

        public async Task<List<Notification>> GetNotificationsByGuidAsync(Guid notificationGuid)
        {
            return await _notificationStorage.GetNotificationsByGuidAsync(notificationGuid);
        }
    }
}