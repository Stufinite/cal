# 課程資料查詢API (API of Course code of Dept. and Time of Course)

此API可以直接查詢`系所的課程代碼`和`課程的上課時間`

## API usage and Results

API使用方式（下面所寫的是api的URL pattern）<br>
(Usage of API (pattern written below is URL pattern))：

1. 取得系所的課程代碼<br>
  (Get Course code of Dept Name.)：<br>
  `/search?dept=<department code>&school=<school>`

  - 範例 (Example)：`/search/?dept=G35&school=NCHU`
  - result：

    ```
    {
    "_id": "585d30e713d16a562bd58069",
    "G35": {
    "optional": {
     "ClassA": {
       "6": [
         "6213",
         "6214",
         "6234"
       ],
       "7": [
         "7131",
         "7134"
       ]
     }
    },
    "obligatory": {
     "ClassA": {
       "6": [
         "6235"
       ],
       "7": [
         "7143",
         "7144"
       ]
     }
    }
    }
    }
    ```

2. 查詢該時段有什麼課可以上：<br>
  需要指定哪一天的哪一節課 `/search?degree=<學制>&day=<星期幾>&time=<第幾節課>&school=<學校名稱>`

  - 範例 (Example)：`/?school=NCHU&degree=U&day=1&time=1`
  - result：

    ```
    [ "1206", "1228", "2026", "2089", "2190", "2201", "2264", "2311", "2323", "3049", "3056", "3056", "3081", "3145", "3145", "3237", "3237", "3290", "3290", "3290", "3290", "3331", "3331", "3404", "3409", "3428", "4085", "4127", "4141", "4189", "4231", "4232", "4232" ]
    ```

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

## Prerequisities

1. OS：Ubuntu / OSX would be nice
2. environment：need `python3`

  - Linux：`sudo apt-get update; sudo apt-get install; python3 python3-dev`
  - OSX：`brew install python3`

3. service：need `mongodb`：

  - Linux：`sudo apt-get install mongodb`

## Installing

1. 安裝此python專案所需要的套件：`pip install -r requirements.txt`(因為需要額外安裝pymongo及jieba等等套件)

## Running & Testing

## Run

1. 第一次的時候，需要先初始化資料庫：`python migrate`
2. Execute : `python manage.py runserver`.

### Break down into end to end tests

目前還沒寫測試...

### And coding style tests

目前沒有coding style tests...

## Deployment

There is no difference between other Django project

You can deploy it with uwsgi, gunicorn or other choice as you want

是一般的django專案，所以他佈署的方式並沒有不同

## Built With

- python3.5
- Django==1.10.4
- mongodb==3.2.11
- pymongo==3.4.0

## Versioning

For the versions available, see the [tags on this repository](https://github.com/david30907d/KCM/releases).

## Contributors

- **張泰瑋** [david](https://github.com/david30907d)

## License

## Acknowledgments

感謝`范耀中`老師的指導
