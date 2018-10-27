import numpy as np

from PIL import Image
from wordcloud import WordCloud
import matplotlib.pyplot as plt
import random

import mpld3
from mpld3 import plugins, utils



class Display():

	# Constructor to initialize attributes:
	def __init__(self, frequenciesDict, maskPath=None):

		# Word Cloud object:
		self.wc = None

		# Sets up the mask:
		mask = np.array(Image.open(maskPath))

		# Initializes word cloud:
		self.wc = WordCloud(background_color="black",
							max_words=1000,
							mask=mask,
							collocations=False,
							random_state=2000)
		# Generate word cloud through dictionary of frequencies:
		self.wc.generate_from_frequencies(frequenciesDict)


	# Produces an image containing the visualization:
	def produceImage(self, name):

		# Function to make words in red scale:
		def grey_color_func(word, font_size, position, orientation, random_state=None,
		                    **kwargs):
		    return "hsl(0, 100%%, %d%%)" % random.randint(40, 80)

		# Produces image:
		default_colors = self.wc.to_array()
		plt.title("#PrayForSyria")
		plt.imshow(self.wc.recolor(color_func=grey_color_func, random_state=500),
		           interpolation="bilinear")
		self.wc.to_file(name)
		plt.axis("off")
		mpld3.show()
		#plt.show()
