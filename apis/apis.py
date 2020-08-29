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
        lon = float(request.GET.get('lon', "0,0"))
        lat = float(request.GET.get('lat', "0,0"))

        logger.debug("apis:zone_population; lat={}, lon={}".format(lat,lon))
        try:
            result = area_search(lon, lat)
            response = Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            traceback.print_exc()
            logger.error("zone_population_view: {}".format(e))
            result = {"message": "ng"}
            response = Response(result, status=status.HTTP_404_NOT_FOUND)

        return response


# -----------------------------------------

postgres_database = os.environ['POSTGRES_DATABASE']
postgres_user = os.environ['POSTGRES_USER']
postgres_password = os.environ['POSTGRES_PASSWORD']
postgres_host = os.environ['POSTGRES_HOST']
postgres_port = os.environ['POSTGRES_PORT']
postgres_dbname = "host='{}' port='{}' dbname='{}' user='{}' password='{}'".\
    format(postgres_host, postgres_port, postgres_database, postgres_user, postgres_password)

import psycopg2
import psycopg2.extras

def executeSql(sql):

    dict_result = []

    # コネクション作成
    # Connect to an existing database
    try:
        connect_name = postgres_dbname

        conn = psycopg2.connect(connect_name)
        conn.autocommit = True

    except psycopg2.Error as e:
        traceback.print_exc()
        err_text = "executeSql(): {}".format(e)
        logger.error(err_text)
        raise Exception(err_text)

    # カーソル作成
    # Open a cursor to perform database operations
    # cur = conn.cursor()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    try:
        # SQLコマンド実行
        # Query the database and obtain data as Python objects
        cur.execute(sql)

        # SQL結果を受け取る
        # cur.fetchone()

        # fetchone()で、１つだけの結果を取り出せる
        # rows = cur.fetchone()
        # print("%d" % (rows[0]))
        # fetchall()で、結果を全て取り出せる
        rows = cur.fetchall()
        #dict_result = rows
        for row in rows:
            dict_result.append(dict(row))

    except psycopg2.Error as e:
        traceback.print_exc()
        err_text = "executeSql(): {}".format(e)
        logger.error(err_text)
        raise Exception(err_text)

    finally:
        # コミット
        # Make the changes to the database persistent
        # conn.commit()

        # クローズ
        # Close communication with the database
        cur.close()
        conn.close()

    return dict_result


# -----------------------------------------
def area_search(lon, lat):

    try:
        sql = "select cityname, jiscode, szone from area.h30_szone where ST_WITHIN(ST_SETSRID(ST_POINT(%f,%f),4326),geom)" % (lon, lat)
        rows = executeSql(sql)
        if len(rows) <= 0:
            raise Exception("area not found")

        result = rows[0]
        result["status"] = True

    except Exception as e:
        logger.error("area_search = {}".format(e))
        result = {
            "status": False,
            "cityname": "",
            "jiscode": 0,
            "szone": 0
        }

    return result
