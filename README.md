# camelcamelflight

TODO: 
- Use node cron to schedule an API request once every day and save data to database (check whether the database already contains an entry for today, to prevent making an API request every time the server is started)
- Every day:
    - Make a get request to the API for a given flight id
    - Check whether there is an row with today's date and that flight id
    - If not, save the date and price
    - Check whether there is data that is more than X days old and delete it. 
- Then display a graph with the price info over time on the root page. 