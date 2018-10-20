from twitterscraper import query_tweets
from bs4 import BeautifulSoup
from pprint import pprint
import datetime as dt
import pymongo
import sys
import codecs
import json



class Fetch():

	# Constructor to initialize attributes:
	def __init__(self):

		# Database handler:
		self.db = None

		# Connects with the database:
		client = pymongo.MongoClient()
		db = client.tweet_db
		self.collection = db.tweet_collection
		self.collection.create_index([("id",pymongo.ASCENDING)],unique=True)

		# Corrects encoding to UTF-8:
		if sys.stdout.encoding != 'UTF-8':
			sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')


	# Fetches at least *count* tweets containing the words *q*:
	def fetchTweets(self, q, count, begindate=dt.date(2006,3,21), enddate=dt.date.today(), save=True, printTweets=False):

		# Function to return the language attribute out of an HTML containing a <p> element:
		def getLang(string):
			soup = BeautifulSoup(string, 'lxml')
			return soup.find('p')["lang"]

		# Performs the query:
		list_of_tweets = query_tweets(q, count, begindate=begindate, enddate=enddate)

		# Checks if saving to database is enabled:
		if (save == True):
			# Loops through obtained tweets:
			for tweet in list_of_tweets:

				# Treats newline and hashtags:
				tweet.text = tweet.text.replace('\n', ' ').replace('\r', ' ')

				# Checks if printing is enabled:
				if (printTweets == True):
					print( '@%s tweeted: %s \n' % ( tweet.user, tweet.text ) )

				# Converts Tweet object to JSON:
				tweetDict = {
						"id" : tweet.id,
						"text" : tweet.text,
						"user" : tweet.user,
						"fullname" : tweet.fullname,
						"lang" : getLang(tweet.html),
						"replies" : tweet.replies,
						"retweets" : tweet.retweets,
						"likes" : tweet.likes,
						"timestamp" : tweet.timestamp
						}
				tweetJson = json.dumps(tweetDict, default=str)

				# Attempts to save in database:
				try:
					self.collection.insert(tweetDict)
				except:
					print("Database insertion failed.")
					pass


	# Function to retrieve a dictionary with the most used words in the db collection.
	# *chosenWords* is a list of words that you want to actually retain in your dictionary. By
	# default, it is passed as None, which retains every word:
	def getMostUsed(self, count=5, saveToFile=False, chosenWords=None):

		# Prepare query:
		query = [
			{ "$project": { "words": { "$split": ["$text", " "] }	} },
			{ "$unwind": { "path": "$words" } },
			{ "$group": { "_id": "$words", "count": { "$sum": 1 } } }
		]

		# Retrieve count of words:
		results = list(self.collection.aggregate(query))

		# Sort result (so most used words are displayed first):
		results.sort(key=lambda x: x["count"], reverse=True)

		# Prepares a file in case we should save to it:
		file = None
		if (saveToFile == True):
			file = open('syria.txt', "a")

		# Prepares a dictionary of frequencies:
		frequencies = {}

		# Print requested results:
		for i in range(count):
			try:
				# Checks if saving to file is enabled:
				if (saveToFile == True):
					if (results[i]["_id"] in chosenWords):
						for j in range(results[i]["count"]):
							file.write(results[i]["_id"] + " ")
				# Adds to dictionary:
				if (results[i]["_id"] in chosenWords) or (chosenWords == None):
					frequencies[results[i]["_id"]] = results[i]["count"]
			except:
				print("Error in encoding when printing most used words")
				pass

		# Returns the dictionary containing the selected words:
		return frequencies
