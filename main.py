import datetime as dt
from fetch import Fetch



if __name__ == '__main__':

	# Performs queries:
	fetchy = Fetch()
	#fetchy.fetchTweets("prayforsyria", 300000, begindate=dt.date(2011,1,21), enddate=dt.date.today())
	fetchy.printMostUsed(200)
	#Or save the retrieved tweets to file:
	#file = open("output.txt","w", encoding="utf-8")
