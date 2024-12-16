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

        public CommonService(UserStorage userStorage, GroupStorage groupStorage, NotificationStorage notificationStorage, UserRelationsStorage userRelationsStorage, GroupRelationsStorage groupRelationsStorage)
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

            if (existingRequest != null)
            {
                throw new InvalidOperationException("Friend request already exists or you are already friends.");
            }

            var friendRequest = new UserRelation
            {
                InitiationUserId = userId,
                RecipientUserId = requestFriendId,
                Status = UserRelationStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };
 
            await _userRelationsStorage.AddFriendshipAsync(friendRequest);
            var user = await _userStorage.GetUserByIdAsync(userId);

            var notification = new Notification
            {
                UserIds = new List<ObjectId>{requestFriendId}, // Who is the recipient
                SenderUserId = user.Id, // Who sent the notification
                Message = $"{user.Username} has sent you a friend request.",
                Type = NotificationType.FriendRequest,
                Status = NotificationStatus.Unread,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationStorage.AddNotificationAsync(notification);
        }
        
        public async Task JoinAGroupRequestAsync(ObjectId userId, ObjectId groupId)
        {
            var existingRequest = await _groupRelationsStorage.GetGroupRelationByIdAsync(userId, groupId);

            if (existingRequest != null)
            {
                throw new InvalidOperationException("Friend request already exists or you are already friends.");
            }

            var groupRequest = new GroupRelation
            {
                UserId = userId,
                GroupId = groupId,
                Status = GroupRelationStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            await _groupRelationsStorage.AddGroupRelationAsync(groupRequest);
            var group = await _groupStorage.GetGroupByIdAsync(groupId);
            var user = await _userStorage.GetUserByIdAsync(userId);


            var notification = new Notification
            {
                UserIds = new List<ObjectId>(group.AdminUserIds), // Who is the recipient
                SenderUserId = userId, // Who sent the notification
                Message = $"{user.Username} has sent a request to join {group.Name}.",
                Type = NotificationType.GroupJoinRequest,
                Status = NotificationStatus.Unread,
                CreatedAt = DateTime.UtcNow
            };
            


            await _notificationStorage.AddNotificationAsync(notification);
        }

        public async Task<bool> ConfirmFriendRequestAsync(ObjectId userId, ObjectId requestFriendId, ObjectId notificationId)
        {
            var friendship = await _userRelationsStorage.GetFriendshipByIdAsync(requestFriendId, userId);
            if (friendship == null || friendship.Status != UserRelationStatus.Pending)
            {
                throw new InvalidOperationException("Friendship request does not exist or has already been confirmed.");
            }

            friendship.Status = UserRelationStatus.Accepted;
            await _userRelationsStorage.UpdateFriendshipAsync(friendship);

            var notification = await _notificationStorage.GetNotificationById(notificationId);
            if (notification != null)
            {
                notification.Status = NotificationStatus.Read;
                await _notificationStorage.UpdateNotificationAsync(notification);
            }

            return true;
        }

        public async Task<bool> RejectFriendRequestAsync(ObjectId userId, ObjectId requestFriendId, ObjectId notificationId)
        {
            var friendship = await _userRelationsStorage.GetFriendshipByIdAsync(userId, requestFriendId);
            if (friendship == null || friendship.Status != UserRelationStatus.Pending)
            {
                throw new InvalidOperationException("Friendship request does not exist or has already been processed.");
            }

            friendship.Status = UserRelationStatus.Rejected;
            await _userRelationsStorage.UpdateFriendshipAsync(friendship);

            var notification = await _notificationStorage.GetNotificationById(notificationId);

            if (notification != null)
            {
                notification.Status = NotificationStatus.Read;
                await _notificationStorage.UpdateNotificationAsync(notification);
            }

            return true;
        }
    }
}
