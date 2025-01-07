using MongoDB.Bson;
using System.Collections.Generic;

namespace F1Shots.Models
{
    public class GroupResponse
    {
        public string Id { get; set; } // The group ID as a string

        private string _name;
        public string Name
        {
            get => _name;
            set => _name = value;
        }

        private List<string> _adminUserIds;
        public List<string> AdminUserIds
        {
            get => _adminUserIds;
            set => _adminUserIds = value.ConvertAll(id => new ObjectId(id).ToString());
        }

        private List<string> _playersIds;
        public List<string> PlayersIds
        {
            get => _playersIds;
            set => _playersIds = value.ConvertAll(id => new ObjectId(id).ToString());
        }

        public List<string> PlayersUserNames { get; set; } // List of player usernames
        public List<int> Years { get; set; } // Years the group wants to participate in
        public bool Public { get; set; } // Group visibility (public or private)
        public bool Open { get; set; } // Group visibility (public or private)

        // Constructor to initialize the list properties to avoid null reference errors
        public GroupResponse()
        {
            _adminUserIds = new List<string>();
            _playersIds = new List<string>();
            PlayersUserNames = new List<string>();
            Years = new List<int>();
        }
    }
}