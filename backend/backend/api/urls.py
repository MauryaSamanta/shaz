
from django.urls import path

from .views.user_views import signup,login
from .views.item_views import upload_zara_items,upload_mns_items, get_all_items, proxy_image
from .views.recommendation_views import get_recommendations, recalculateuservector
from .views.action_views import save_action
from .views.closets_views import create_closet,get_user_closets,add_item_to_closets
from .views.cart_views import get_cart,add_to_cart, remove_from_cart
urlpatterns=[
   path("auth/signup", signup),
   path("auth/login", login),
   ##uploading and handling items
   path("items/create",upload_mns_items),
   path("items/getall",get_all_items),
   path("items/getimage", proxy_image),

   ##swiping logics
   path("user/swipes",save_action),

   ##getting recommends
   path("items/getinitial",get_recommendations),

   ##Recalulating the user vector to train model
   path("user/calculatevector", recalculateuservector),

   ##closets urls
   path('closets/create/', create_closet),
   path('closets/add-item/', add_item_to_closets),
   path('closets/<str:user_id>/', get_user_closets),


   ##cart urls
     path('cart/<uuid:user_id>/', get_cart),
    path('cart/add/', add_to_cart),
    path('cart/remove/', remove_from_cart),
]