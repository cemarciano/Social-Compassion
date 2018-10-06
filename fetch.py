import pymongo
from pymongo import MongoClient
import json
import twitter
from pprint import pprint


CONSUMER_KEY = "qqii6KcPy22XPZhFkWZQ5Y77j"
CONSUMER_SECRET = "stK29zKQaObUoWk3qvYu1Fui4CWhoQkMNyKlnfogsymFX4UmXu"
OAUTH_TOKEN = "87738700-EAQ3msiJL9ftEnxrezsAT9XhgNpL7IMa0PzE1ze9n"
OAUTH_TOKEN_SECRET = "BAD3mc4yW1fdofNZ5OClRDjWLOZHHd41CT1H7aqfBgAZ2"


auth=twitter.oauth.OAuth(OAUTH_TOKEN,OAUTH_TOKEN_SECRET,CONSUMER_KEY,CONSUMER_SECRET)
twitter_api=twitter.Twitter(auth=auth)



client=MongoClient()
db=client.tweet_db
tweet_collection=db.tweet_collection
tweet_collection.create_index([("id",pymongo.ASCENDING)],unique=True)


count=50
q="%23prayforsyria"
search_results=twitter_api.search.tweets(count=count,q=q)
#pprint(search_results['search_metadata'])


statuses=search_results["statuses"]

since_id_new=statuses[-1]['id']

for statues in statuses:
       try:
              tweet_collection.insert(statues)
       except:
              pass
       
       
tweet_cursor=tweet_collection.find()
print(tweet_cursor.count())
user_cursor=tweet_collection.distinct("user.id")
print(len(user_cursor))

for document in tweet_cursor:
       try:
              print('-----')
              print('name:-',document["user"]["name"])
              print('text:-',document["text"])
              print('Created Date:-',document["created_at"])
       except:
              print("Error in Encoding")
              pass
