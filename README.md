# camelcamelflight

TODO: 
- Use node cron to schedule an API request once every day and save data to database (check whether the database already contains an entry for today, to prevent making an API request every time the server is started)
- Every day:
    - Check whether there is data that is more than X days old and delete it. 
- Switch to making API requests to the actual API, rather than dummy. 
- Let the user select which flight to track and view
