from twitterscraper import query_tweets
from bs4 import BeautifulSoup
from pprint import pprint
import datetime as dt
import pymongo
import sys
import codecs
import json
import copy



class Fetch():

	# Constructor to initialize attributes:
	def __init__(self):

		# Database handler:
		self.db = None
		# Dictionary of most used words:
		self.mostUsed = {}

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
				except pymongo.errors.PyMongoError as e:
					print("Database insertion failed: %s" % e)



	# Function to retrieve a dictionary with most used words. calculateMostUsed() must have been called before.
	# *chosenWords* is a list of words that you want to actually retain in your dictionary. By
	# default, it is passed as None, which retains every word:
	def getMostUsed(self):
		# Returns frequency of words:
		return self.mostUsed


	# Function to remove any word from the dictionary that is not desired:
	def filterMostUsed(self, chosenWords):
		# Retrieves frequency of words:
		for word in list(self.mostUsed):
			if word not in chosenWords:
				del self.mostUsed[word]


	# Function to save most used words into a file. calculateMostUsed() must have been called before.
	def saveMostUsed(self):
		# Prepares a file:
		file = open('syria.txt', "a")
		# Loops through dictionary:
		for word in self.mostUsed:
			for j in range(self.mostUsed[word]):
				file.write(word + " ")




	# Function to print most used words. calculateMostUsed() must have been called before.
	def printMostUsed(self):
		# Loops through dictionary:
		for word in self.mostUsed:
			print ( 'Word \"%s\" appears %s times' % ( results[i]["_id"], results[i]["count"] ) )



	# Function to save most used words into a JSON file. calculateMostUsed() must have been called before.
	def jsonMostUsed(self):
		# Prepares main JSON list:
		list = []
		# Prepares list of words:
		words = []
		# Iterates through frequencies:
		for word in self.mostUsed:
			obj = {
				"name" : word,
				"value" : self.mostUsed[word]
			}
			# Appends object to list:
			words.append(obj)
		mainObj = {
			"country": "syria",
			"frequencies": words
		}
		list.append(mainObj)
		# Saves to file:
		with open('syria.json', 'w') as fp:
			json.dump(list, fp)



	# Function to retrieve a dictionary with the most used words in the db collection.
	def calculateMostUsed(self, count=5, smooth=0):

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

		# Print requested results:
		for i in range(count):
			# Value to be added to dictionary (how many times a word has appeared):
			valueToDict = results[i]["count"]
			# Checks if smoothing is enable. This makes words that appear a lot become smaller:
			if (smooth != 0):
				frac = results[i]["count"] / smooth
				valueToDict -= results[i]["count"]*(frac**2)
			self.mostUsed[results[i]["_id"]] = valueToDict
