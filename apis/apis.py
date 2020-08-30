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
import codecs
import traceback

import config.settings as settings
import requests

#-----------------------------------
import logging
logger = logging.getLogger('apis')


# -----------------------------------------
class getZonePopulationAPIView(APIView):
    """
    小地域(ゾーン)別滞留人数取得API
    """

    def get(self, request, *args, **keywords):
        lon = float(request.GET.get('lon', "0.0"))
        lat = float(request.GET.get('lat', "0.0"))

        logger.debug("apis:zone_population; lat={}, lon={}".format(lat,lon))
        try:
            result = area_search(lon, lat)
            response = Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            traceback.print_exc()
            logger.error("apis:zone_population: {}".format(e))
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

        szone = result["szone"]
        population = get_population(szone)
        result["population"] = population

    except Exception as e:
        logger.error("area_search = {}".format(e))
        result = {
            "status": False,
            "cityname": "",
            "jiscode": 0,
            "szone": 0,
            "population": 0
        }

    return result


# -----------------------------------------
def get_population(szone):

    try:
        population = 0
        kcode = int(szone / 10)  # 小ゾーン -> 計画基本ゾーン

        sql = "select * from area.population where kcode=%d" % (kcode)
        rows = executeSql(sql)
        if len(rows) <= 0:
            raise Exception("population not found")

        result = rows[0]
        dt_now = datetime.now()
        hour = dt_now.hour

        str_now = "t%d" % (hour)
        population = result[str_now]

    except Exception as e:
        logger.error("get_population = {}".format(e))

    return population


# -----------------------------------------
class getPlaceSpotsAPIView(APIView):
    """
    近くの減点スポット一覧
    """

    def get(self, request, *args, **keywords):
        lon = float(request.GET.get('lon', "0.0"))
        lat = float(request.GET.get('lat', "0.0"))

        logger.debug("apis:place_spots")

        try:
            url = "https://o3e0b9l5cc.execute-api.ap-northeast-1.amazonaws.com/production/place/spots?lat={}&long={}".format(lat,lon)
            request_result = requests.get(url)

            json_data = json.loads(request_result.text)

            features = []
            for row in json_data:
                poi_lon = float(row["long"])
                poi_lat = float(row["lat"])

                feature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [poi_lon, poi_lat]
                    },
                    'properties': {
                        "id": row["id"],
                        "name": row["name"],
                        "address": row["address"],
                        "lat": poi_lat,
                        "long": poi_lon,
                        "tag": row["tag"],
                        "message": row["message"]
                    }
                }
                features.append(feature)

            result = {
                "type": "FeatureCollection",
                "name": "plase_spot",
                "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
                "features": features
            }
            response = Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            traceback.print_exc()
            logger.error("apis:place_spots: {}".format(e))
            result = {"message": "ng"}
            response = Response(result, status=status.HTTP_404_NOT_FOUND)

        return response


#-----------------------------------------
def read_json(filename):
    """
    JSONファイル読み込む
    """
    try:
        basedir = os.path.dirname(os.path.abspath(__file__))
        indir = os.path.join(basedir, "data")
        readfilename = os.path.join(indir, filename)

        with codecs.open(readfilename, 'r', "utf-8") as f:
            jsonData = json.loads(f.read())

    except IOError as e:
        traceback.print_exc()
        raise Exception(str(e))

    return jsonData

# -----------------------------------------
import pandas as pd

class getAreaSzoneAPIView(APIView):
    """
    小地域のGeoJson取得
    """

    def get(self, request, *args, **keywords):
        logger.debug("apis:area_szone")

        try:
            sql = "select * from area.population"
            population_list = executeSql(sql)
            if len(population_list) <= 0:
                raise Exception("population not found")

            # DataFrameに変換
            df_population = pd.DataFrame(population_list)
            # print(df_population.head())
            # print(df_population.info())

            dt_now = datetime.now()
            hour = dt_now.hour
            str_now = "t%d" % (hour)

            json_szone = read_json("szone.geojson")

            features = json_szone["features"]
            for feature in features:
                population = 0

                szone = feature["properties"]["szone"]
                kcode = int(szone / 10)  # 小ゾーン -> 計画基本ゾーン

                df_population_one = df_population[(df_population["kcode"] == kcode)]
                if len(df_population_one) > 0:
                    population = df_population_one.iloc[0][str_now]

                feature["properties"]["population"] = population

            result = json_szone
            response = Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            traceback.print_exc()
            logger.error("apis:area_szone: {}".format(e))
            result = {"message": "ng"}
            response = Response(result, status=status.HTTP_404_NOT_FOUND)

        return response


# -----------------------------------------
def get_population_from_table(szone):

    try:
        population = 0
        kcode = int(szone / 10)  # 小ゾーン -> 計画基本ゾーン

        sql = "select * from area.population where kcode=%d" % (kcode)
        rows = executeSql(sql)
        if len(rows) <= 0:
            raise Exception("population not found")

        result = rows[0]
        dt_now = datetime.now()
        hour = dt_now.hour

        str_now = "t%d" % (hour)
        population = result[str_now]

    except Exception as e:
        logger.error("get_population = {}".format(e))

    return population


