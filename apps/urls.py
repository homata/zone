from django.urls import include, path
from . import views
from django.views.generic.base import RedirectView

# アプリケーションの名前空間
app_name = 'apps'

urlpatterns = [
    path('', views.index, name='index'),

]
