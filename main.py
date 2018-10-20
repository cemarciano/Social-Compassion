import datetime as dt
from fetch import Fetch
from display import Display


if __name__ == '__main__':

	# Performs queries:
	fetchy = Fetch()
	#fetchy.fetchTweets("prayforsyria", 300000, begindate=dt.date(2011,1,21), enddate=dt.date.today())

	# Defines words that we want to use in the visualization. All other words will be ignored:
	chosenWords = ["Syria", "people", "you", "all", "no", "we", "my", "be", "world", "will", "about", "innocent",
					"Allah", "paz", "just", "pray", "heart", "Syrian", "mundo", "children", "who", "one", "don't",
					"please", "help", "Pray", "more", "like", "apoyo", ":(", "oración", "#Aleppo", "going", "war",
					"God", "uno", "need", "prayers", "ayuno", "happening", "killed", "being", "peace", "sad", "NO",
					"know", "now", "because", "stop", "many", "everyone", "live", "unimos", "really", "lives", "orar",
					"much", "love", "suffering", "protect", "guerra", "morning", "even", "todos", "hope", "country",
					"#LLAP", "forget", ":'(", "never", "over", "every", "still", "brothers", "think", "llamado", "ayunar",
					"human", "time", "feel", "praying", "keep", "bomb", "bombing", "kids", "Virgen", "today", "Assad", "better",
					"diligencia", "killing", "breaks", "trabajo", "video", "life", "firmemente", "rezar", "where", "lost"
					"kill", "pidiendo", "humanity", "deserve", "always", "gente", "little", "take", "safe", "end", "say",
					"sisters", "doesn't", "any", "dying", "dead", "after", "things", "good", "Trump", "some", "child", "needs",
					"heartbreaking", "other", "Dios", "care", "Syrians", "US", "personas", "news", "civilians", "não", "against",
					"inocentes", "unidos", "media", "family", "something", "save", "<3", "wish", "believe", "families", "nothing",
					"die", "died", "place", "attack", "sorry", "thoughts", "niños", "Papa", "happened", "blood", "bombs", "way",
					"years", "refugees", "last", "back", "same", "oracion", "before", "prayer", "whole", "violence", "support", "bless",
					"death", "boy", "anything", "hate"]
	# Obtains a dictionary where words are keys and values are how many times they appear in the tweet texts:
	frequenciesDict = fetchy.getMostUsed(500, chosenWords=chosenWords)

	# Initializes Word Cloud using the frequency dictionary:
	disp = Display(frequenciesDict, maskPath="Visualization/machine_gun.png")

	# Creates an image:
	disp.produceImage("Visualization/syria.png")
