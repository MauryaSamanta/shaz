
from django.urls import path

from .views.brand_views import brand_login, brand_signup

from .views.order_views import create_order_db, get_all_orders, get_user_orders

from .views.address_views import create_address, get_user_addresses

from .views.razorpay_views import create_order, razorpay_checkout, verify_payment

from .views.user_views import complete_signup, create_shadow_user, register_fcm_token, signup,login, mark_seen_bulk, update_rewards
from .views.item_views import  get_all_items, proxy_image, upload_scraped_items, upload_seller_items
from .views.recommendation_views import discover_similar, find_duplicate_images, get_recommendations, recalculateuservector
from .views.action_views import save_action,get_liked_items
from .views.closets_views import add_closet_items_to_cart, add_collaborator, create_closet, delete_closet,get_user_closets,add_item_to_closets
from .views.cart_views import get_cart,add_to_cart, remove_from_cart
urlpatterns=[
   path("auth/signup", complete_signup),
   path("auth/login", login),
   path("auth/shadow", create_shadow_user),
   
   ##uploading and handling items
   path("items/create",upload_scraped_items),
   path("items/getall",get_all_items),
   path("items/getimage", proxy_image),

   ##swiping logics
   path("user/swipes",save_action),
   path('liked-items/<str:user_id>/', get_liked_items),


   ##getting recommends
   path("items/getinitial",get_recommendations),
   path("items/discover_similar",discover_similar),
   path("items/find_dups",  find_duplicate_images),
   ##Recalulating the user vector to train model
   path("user/calculatevector", recalculateuservector),
   path("user/update_rewards", update_rewards),
   path("user/mark_seen_bulk", mark_seen_bulk),

   path("user/register_fcm",register_fcm_token),
   ##closets urls
   path('closets/create/', create_closet),
   path('closets/add-item/', add_item_to_closets),
   path('closets/<str:user_id>/', get_user_closets),
   path('closets/add-collab', add_collaborator),
   path('closets/delete', delete_closet),
   path('closets/add-to-cart', add_closet_items_to_cart),

   ##cart urls
     path('cart/<uuid:user_id>/', get_cart),
    path('cart/add/', add_to_cart),
    path('cart/remove/', remove_from_cart),

    ##address routes
    path('address/', create_address),
    path('address/<uuid:user_id>/', get_user_addresses),
    ##razorpay payment routes
    path('order', create_order),
    path("razorpay-checkout/", razorpay_checkout),
    path("verify-payment/",verify_payment),

    ##order creation
    path('order-db/', create_order_db),
    path('order/user/<uuid:user_id>', get_user_orders),
    path('order/all', get_all_orders),

    ##seller
    path('seller-signup/',brand_signup),
    path('seller-login/', brand_login)
]