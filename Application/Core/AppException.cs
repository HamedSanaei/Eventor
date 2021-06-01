namespace Application.Core
{
    public class AppException
    {
        // details ===> stacktrace errors! which is in developer mode not production mode!!
        public AppException(int statusCode, string message, string details = null)
        {
            StatusCode = statusCode;
            Message = message;
            Details = details;
        }

        public int StatusCode { get; set; }
        public string Message { get; set; }
        public string Details { get; set; }
    }
}