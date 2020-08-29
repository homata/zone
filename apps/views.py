from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.views import generic
from rest_framework.response import Response
from rest_framework import status
from django.utils.translation import ugettext as _

from django.shortcuts import get_object_or_404

import os
import traceback
import json

#-----------------------------------
import logging
logger = logging.getLogger('apps')


#----------------------------
def index(request):
    """
    トップページ
    """

    try:
        #logger.debug("index()")
        contexts = {}

        # 現在ログインしている?
        if request.user.is_authenticated:
            contexts['user'] = {"username": request.user.username, "user_id": request.user.id, "is_authenticated": True}

        return render(request, 'apps/index.html',contexts)

    except Exception as e:
        logger.error('system error: '.format(e))
        traceback.print_exc()
        return render(request, 'apps/index.html', {})



