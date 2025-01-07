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
                        UserIds = new List<ObjectId> { requestFriendId }, // Who is the recipient
                        SenderUserId = user1.Id, // Who sent the notification
                        Message = $"{user1.Username} has sent you a friend request.",
                        Type = NotificationType.FriendRequest,
                        Status = NotificationStatus.Unread,
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
                    UserIds = new List<ObjectId> { requestFriendId }, // Who is the recipient
                    SenderUserId = user.Id, // Who sent the notification
                    Message = $"{user.Username} has sent you a friend request.",
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
                notification.Status = NotificationStatus.ReadAndResponded;
                await _notificationStorage.UpdateNotificationAsync(notification);
            }
            
            var user = await _userStorage.GetUserByIdAsync(userId);
            
            var newNotification = new Notification
            {
                UserIds = new List<ObjectId> { notification.SenderUserId }, // Who is the recipient
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
                notification.Status = NotificationStatus.ReadAndResponded;
                await _notificationStorage.UpdateNotificationAsync(notification);
            }
            
            var user = await _userStorage.GetUserByIdAsync(userId);
            
            var newNotification = new Notification
            {
                UserIds = new List<ObjectId> { notification.SenderUserId }, // Who is the recipient
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

        public async Task<Group?> InviteUserToGroupAsync(ObjectId groupId, ObjectId userToBeInvitedId, ObjectId userInvitingId)
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
                        UserIds = new List<ObjectId> { userToBeInvitedId }, // Who is the recipient
                        SenderUserId = userInvitingId, // Who sent the notification
                        GroupId = groupId,
                        Message = $"You have been invited to join {group.Name}.",
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
                    UserIds = new List<ObjectId> { userToBeInvitedId }, // Who is the recipient
                    SenderUserId = userInvitingId, // Who sent the notification
                    Message = $"{user.Username} has sent you a group invite to:  {group.Name}.",
                    Type = NotificationType.FriendRequest,
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

        public async Task ConfirmGroupInviteAsync(ObjectId userId, ObjectId groupId, ObjectId notificationId)
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

            var notification = await _notificationStorage.GetNotificationById(notificationId);
            if (notification != null)
            {
                notification.Status = NotificationStatus.ReadAndResponded;
                await _notificationStorage.UpdateNotificationAsync(notification);
            }
            
            var user = await _userStorage.GetUserByIdAsync(userId);
            
            var newNotification = new Notification
            {
                UserIds = new List<ObjectId> { notification.SenderUserId }, // Who is the recipient
                SenderUserId = userId,
                GroupId = groupId,
                Message = $"Your group invitation to {user.Username} has been confirmed.",
                Type = NotificationType.Info,
                Status = NotificationStatus.Unread,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationStorage.AddNotificationAsync(newNotification);
        }

        public async Task RejectGroupInviteAsync(ObjectId userId, ObjectId groupId, ObjectId notificationId)
        {
            var groupRelation = await _groupRelationsStorage.GetGroupRelationByIdAsync(userId, groupId);
            if (groupRelation == null || groupRelation.Status != GroupRelationStatus.InvitePending)
            {
                throw new InvalidOperationException(
                    "Group invitation does not exist or has already been processed.");
            }

            groupRelation.Status = GroupRelationStatus.InviteRejected;
            await _groupRelationsStorage.UpdateGroupRelationAsync(groupRelation);

            var notification = await _notificationStorage.GetNotificationById(notificationId);
            if (notification != null)
            {
                notification.Status = NotificationStatus.ReadAndResponded;
                await _notificationStorage.UpdateNotificationAsync(notification);
            }
            var user = await _userStorage.GetUserByIdAsync(userId);
            
            var newNotification = new Notification
            {
                UserIds = new List<ObjectId> { notification.SenderUserId }, // Who is the recipient
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

                    var notification1 = new Notification
                    {
                        UserIds = group.AdminUserIds, // Who is the recipient
                        SenderUserId = userId, // Who sent the notification
                        GroupId = groupId,
                        Message = $"You have been invited to join {group.Name}.",
                        Type = NotificationType.GroupInviteRequest,
                        Status = NotificationStatus.Unread,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _notificationStorage.AddNotificationAsync(notification1);


                    return group;
                }


                existingRequest.Status = GroupRelationStatus.InvitePending;
                existingRequest.UserToBeInvitedId = userId;
                existingRequest.GroupId = groupId;

                var user = await _userStorage.GetUserByIdAsync(userId);

                var notification = new Notification
                {
                    UserIds = group.AdminUserIds, // Who is the recipient
                    SenderUserId = userId, // Who sent the notification
                    Message = $"{user.Username} requests to join:  {group.Name}.",
                    Type = NotificationType.GroupJoinRequest,
                    Status = NotificationStatus.Unread,
                    CreatedAt = DateTime.UtcNow
                };

                await _notificationStorage.AddNotificationAsync(notification);

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

        public async Task ConfirmGroupJoinRequestAsync(ObjectId userConfirmingId, ObjectId userToBeConfirmedId, ObjectId groupId, ObjectId notificationId)
        {
            var groupRelation = await _groupRelationsStorage.GetGroupRelationByIdAsync(userToBeConfirmedId, groupId);
            if (groupRelation == null || groupRelation.Status != GroupRelationStatus.JoinPending)
            {
                throw new InvalidOperationException(
                    "Group join request does not exist or has already been processed.");
            }

            groupRelation.Status = GroupRelationStatus.Accepted;
            await _groupRelationsStorage.UpdateGroupRelationAsync(groupRelation);

            var notification = await _notificationStorage.GetNotificationById(notificationId);
            if (notification != null)
            {
                notification.Status = NotificationStatus.ReadAndResponded;
                await _notificationStorage.UpdateNotificationAsync(notification);
            }
            
            var group = await _groupStorage.GetGroupByIdAsync(groupId);
            
            group.PlayersUserNames.Add(await _userStorage.GetUsernameByIdAsync(userToBeConfirmedId));
            group.PlayersIds.Add(userToBeConfirmedId);
            await _groupStorage.UpdateGroupAsync(group);
            
            var newNotification = new Notification
            {
                UserIds = new List<ObjectId> { userToBeConfirmedId }, // Who is the recipient
                SenderUserId = userConfirmingId,
                GroupId = ObjectId.Empty,
                Message = $"Your group join request to {group.Name} has been confirmed.",
                Type = NotificationType.Info,
                Status = NotificationStatus.Unread,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationStorage.AddNotificationAsync(newNotification);
        }

        public async Task RejectGroupJoinRequestAsync(ObjectId userRejectingId, ObjectId userToBeRejectedId, ObjectId groupId, ObjectId notificationId)
        {
            var groupRelation = await _groupRelationsStorage.GetGroupRelationByIdAsync(userToBeRejectedId, groupId);
            if (groupRelation == null || groupRelation.Status != GroupRelationStatus.JoinPending)
            {
                throw new InvalidOperationException(
                    "Group join request does not exist or has already been processed.");
            }

            groupRelation.Status = GroupRelationStatus.JoinRejected;
            await _groupRelationsStorage.UpdateGroupRelationAsync(groupRelation);

            var notification = await _notificationStorage.GetNotificationById(notificationId);
            if (notification != null)
            {
                notification.Status = NotificationStatus.ReadAndResponded;
                await _notificationStorage.UpdateNotificationAsync(notification);
            }
            
            var group = await _groupStorage.GetGroupByIdAsync(groupId);
            
            var newNotification = new Notification
            {
                UserIds = new List<ObjectId> { userToBeRejectedId }, // Who is the recipient
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
                throw new InvalidOperationException(
                    "Group join request already exists or you already joined that group.");
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

            var notification = new Notification
            {
                UserIds = new List<ObjectId>(group.AdminUserIds), // Who is the recipient
                SenderUserId = userId, // Who sent the notification
                GroupId = groupId,
                Message = $"{user.Username} has sent a request to join {group.Name}.",
                Type = NotificationType.GroupJoinRequest,
                Status = NotificationStatus.Unread,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationStorage.AddNotificationAsync(notification);
        }

        public async Task<List<GroupRelation>> GetGroupRelationsByGroupIdAsync(ObjectId groupId)
        {
            return await _groupRelationsStorage.GetGroupRelationsByGroupIdAsync(groupId);
        }

        public async Task RemovePlayerFromGroupAsync(ObjectId groupObjectId, ObjectId playerObjectId)
        {
            var group = await _groupStorage.GetGroupByIdAsync(groupObjectId);

            group.PlayersIds.Remove(playerObjectId);
            group.PlayersUserNames.Remove(await _userStorage.GetUsernameByIdAsync(playerObjectId));

            await _groupStorage.UpdateGroupAsync(group);

            var notification = new Notification
            {
                UserIds = new List<ObjectId> { playerObjectId }, // Who is the recipient
                SenderUserId = ObjectId.Empty, // Who sent the notification
                GroupId = groupObjectId,
                Message = $"You have been removed from {group.Name}.",
                Type = NotificationType.Info,
                Status = NotificationStatus.Unread,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationStorage.AddNotificationAsync(notification);
        }
    }
}