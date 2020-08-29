from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils.translation import ugettext as _
from django.http import JsonResponse

from datetime import datetime
from datetime import timedelta
import os
import csv
import json
import traceback

import config.settings as settings


#-----------------------------------
import logging
logger = logging.getLogger('apis')


# -----------------------------------------
class getZonePopulationAPIView(APIView):
    """
    小地域(ゾーン)別滞留人数取得API
    """

    def get(self, request, *args, **keywords):
        result = {"message": "ok"}

        try:
            response = Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            traceback.print_exc()
            logger.error("zone_population_view: {}".format(e))
            response = Response(result, status=status.HTTP_404_NOT_FOUND)

        return response
