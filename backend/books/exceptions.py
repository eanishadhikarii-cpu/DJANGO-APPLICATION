from rest_framework.views import exception_handler

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    
    if response is not None:
        error_msg = "An error occurred"
        if isinstance(response.data, dict):
            # If the error is a dictionary (like validation errors), grab the first error message
            first_key = list(response.data.keys())[0]
            if isinstance(response.data[first_key], list):
                error_msg = response.data[first_key][0]
            else:
                error_msg = str(response.data[first_key])
        elif isinstance(response.data, list):
            error_msg = response.data[0]
        else:
            error_msg = str(response.data)
            
        response.data = {
            "success": False,
            "error": str(error_msg)
        }
    return response
