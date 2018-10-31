import cv2
import numpy as np

dim1 = 2
dim2 = 7

img = cv2.imread('result.png',0)
kernel1 = np.ones((dim1,dim1),np.uint8)
kernel2 = np.ones((dim2,dim2),np.uint8)
op1 = cv2.dilate(img,kernel1,iterations = 2)
op2 = cv2.erode(op1,kernel2,iterations = 2)
cv2.imshow('image',op2)
cv2.imwrite('result_morpho.png',op2)
cv2.waitKey(0)
cv2.destroyAllWindows()
