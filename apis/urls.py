from django.urls import include, path
from . import views
from . import apis

app_name = 'apis'

urlpatterns = [
    path('zone/population/', apis.getZonePopulationAPIView.as_view(), name='zone_population'),

    path('place/spots/', apis.getPlaceSpotsAPIView.as_view(), name='place_spots'),
]
