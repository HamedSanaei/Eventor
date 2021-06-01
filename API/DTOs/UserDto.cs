namespace API.DTOs
{
    // The information we want send back to user after successful login.
    public class UserDto
    {
        public string DisplayName { get; set; }
        public string Token { get; set; }
        public string UserName { get; set; }
        public string Image { get; set; }

    }
}