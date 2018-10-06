import pymongo
from pymongo import MongoClient
import json
import twitter
from bson.son import SON
from pprint import pprint


class Fetch():

	def __init__(self):

		self.twitter_api = None
		self.tweet_collection = None

		# Sets up key information:
		CONSUMER_KEY = "qqii6KcPy22XPZhFkWZQ5Y77j"
		CONSUMER_SECRET = "stK29zKQaObUoWk3qvYu1Fui4CWhoQkMNyKlnfogsymFX4UmXu"
		OAUTH_TOKEN = "87738700-EAQ3msiJL9ftEnxrezsAT9XhgNpL7IMa0PzE1ze9n"
		OAUTH_TOKEN_SECRET = "BAD3mc4yW1fdofNZ5OClRDjWLOZHHd41CT1H7aqfBgAZ2"

		# Creates an oauth object to authenticate:
		auth=twitter.oauth.OAuth(OAUTH_TOKEN,OAUTH_TOKEN_SECRET,CONSUMER_KEY,CONSUMER_SECRET)
		self.twitter_api=twitter.Twitter(auth=auth)

		# Connects with the database:
		client=MongoClient()
		db=client.tweet_db
		self.tweet_collection = db.tweet_collection
		self.tweet_collection.create_index([("id",pymongo.ASCENDING)],unique=True)


	# Function to use the Twitter API to fetch *count* tweets containing *q*:
	def fetchTweets(self, q, count=15, save=True):

		search_results = self.twitter_api.search.tweets(count=count,q=q)
		tweetList = search_results["statuses"]
		#since_id_new=tweetList[-1]['id']

		if (save == True):
			for tweet in tweetList:
				try:
					self.tweet_collection.insert(tweet)
				except:
					pass


	# Function to print entries in database:
	def printTweets(self):

		# Retrievs all data:
		tweet_cursor = self.tweet_collection.find()
		# Prints total entries:
		print(tweet_cursor.count())
		# Retrieves number of distinct users:
		user_cursor = self.tweet_collection.distinct("user.id")
		# Prints number of distinct users:
		print(len(user_cursor))

		# Prints all tweets:
		for document in tweet_cursor:
			try:
				print('-----')
				print('name:-',document["user"]["name"])
				print('text:-',document["text"])
				print('Created Date:-',document["created_at"])
			except:
				print("Error in Encoding")
				pass

	def printMostUsed(self, count=5):

		# Prepare query:
		query = [
			{ "$project": { "words": { "$split": ["$text", " "] }	} },
			{ "$unwind": { "path": "$words" } },
			{ "$group": { "_id": "$words", "count": { "$sum": 1 } } }
		]

		# Retrieve count of words:
		results = list(self.tweet_collection.aggregate(query))

		# Sort result (so most used words are displayed first):
		results.sort(key=lambda x: x["count"], reverse=True)

		# Print requested results:
		for i in range(count):
			try:
				pprint(results[i])
			except:
				print("Error in encoding")
				pass
