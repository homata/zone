Memo
----

### Git

```
$ git init
```

### 仮想環境

```
$ python -m venv .zone
$ .zone\Scripts\activate
$ deactivate
$ python -m pip install --upgrade pip
```

### インストール
 
```
$ python -V
```

```
$ pip install django
$ pip install django-environ
$ pip install django-extensions
$ pip install markdown
$ pip install gunicorn

$ pip install django-filter
$ pip install django-debug-toolbar

$ pip install dj-database-url
$ pip install psycopg2-binary
$ pip install django-cleanup

$ pip install djangorestframework
$ pip install djangorestframework-gis

$ pip freeze > requirements.txt
```

### プロジェクトの作成

```
$ django-admin startproject config
$ mv condig zone
$ cd zone
```

```
$ python manage.py runserver
-> http://localhost:8000/
```

### データベース

データベース削除
```
$ dropdb -U postgres zonedb
```

データベース作成
```
$ createdb -E utf8 -U postgres zonedb
$ psql -l -U postgres
```

データベース拡張インストール (Must be superuser to create this extension.)
```
$ psql -U postgres -d zonedb -c "CREATE EXTENSION postgis;"
```

データベース初期化
```
(env) $ python manage.py makemigrations
(env) $ python manage.py migrate
```

### スーパーユーザー作成

```
$ python manage.py createsuperuser
Username (leave blank to use 'homata'): admin
Email address: hoge@fuga.com
Password: xxxxxx
Password (again): xxxxxx
Superuser created successfully.
```

### アプリケーション作成

```
$ django-admin startapp apis
$ django-admin startapp apps
```

### contrib

```
$ cd contrib
$ npm init
```
