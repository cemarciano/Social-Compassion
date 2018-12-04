import datetime as dt
from fetch import Fetch
from display import Display
import pprint


if __name__ == '__main__':

	# Performs queries:
	fetchy = Fetch()
	fetchy.fetchTweets("prayforsyria", 1000, begindate=dt.date(2011,1,21), enddate=dt.date.today())

	# Defines words that we want to use in the visualization. All other words will be ignored:
	chosenWords = ["Syria", "people", "you", "all", "no", "we", "world", "will", "about", "innocent",
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
					"death", "boy", "anything", "hate", "here", "watch", "air", "countries", "everyday", "words", "UK", "ppl", "under",
					"bad", "jornada", "god", "home", "trending", "seeing", "living", "crying", "nada", "trend", "everything", "saudara",
					"sin", "pain", "horrible", "solo", "real", "Palestine", "remember", "Bashar", "bombed", "día", "look", "Jesus", "eyes",
					"power", "strikes", "hear", "mais", "chemical", "picture", "stand", "poor", "million", "vida", "government", "situation",
					"tweet", "tears", "wrong", "hacer", "triste", "watching", "porque", "cry", "word", "mean", "sleep", "night", "enough",
					"amor", "victims", "money", "done", "man", "affected", "untuk", "again", "mercy", "happen", "yet", "cruel", "moment",
					"year", "poder", "hurts", "estamos", "humans", "parar", "understand", "imagine"]

	# Calculates most used words in tweets:
	fetchy.calculateMostUsed(700)#, smooth=12000)

	# Recovers only wanted words:
	fetchy.filterMostUsed(chosenWords)

	# Saves data to JSON file:
	fetchy.jsonMostUsed()

	# Obtains a dictionary where words are keys and values are how many times they appear in the tweet texts:
	frequenciesDict = fetchy.getMostUsed();

	# Initializes Word Cloud using the frequency dictionary:
	disp = Display(frequenciesDict, maskPath="Visualization/img/machine_gun.png")

	# Creates an image:
	#disp.produceImage("Visualization/syria.png")
