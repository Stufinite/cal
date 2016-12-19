# 搜尋引擎（Search Engine）

選課小幫手搜尋引擎
使用KCM、KEM等輔助工具
當使用者所搜尋的名稱查無結果時
回傳系統`推測的相關課程並推荐給使用者`

### API usage and Results

API使用方式（下面所寫的是api的URL pattern）  
(Usage of API (pattern written below is URL pattern))：

1. 簡稱、課程名稱、老師、課號搜尋：取得課程在資料庫的id (Get id of database by Course Name. Query with abbreviation is allowed. Put the Course Name you want to query after `/?keyword=`)： `/search?keyword={課程名稱、老師名稱、課程id, CourseName, Professor, CourseID}&school={學校名稱, School Name}`
  * 範例 (Example)：`/search/?keyword=計概&school=NCHU`
  * result：
  ```
  [
      {
        "weight": 0,
        "DBid": 759
      },
      {
        "weight": 0,
        "DBid": 2208
      },
      {
        "weight": 0,
        "DBid": 2210
      }
  ]
  ```

2. 關鍵字查詢：`中國歷史與民間傳說` 可以用 `中國` `歷史` 這樣的複數關鍵字去查詢
  * 範例 (Example)：`/search/?keyword=中國+歷史&school=NCHU`
  * result：
  ```
  [
      {
        "DBid": 1813,
        "weight": 0
      },
      {
        "DBid": 1814,
        "weight": 0
      },
      {
        "DBid": 1815,
        "weight": 0
      },
      {
        "DBid": 1816,
        "weight": 0
      }
  ]
  ```
## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisities

1. OS：Ubuntu / OSX would be nice
2. environment：need `python3`
  * Linux：`sudo apt-get update; sudo apt-get install; python3 python3-dev`
  * OSX：`brew install python3`
3. service：need `mongodb`：
  * Linux：`sudo apt-get install mongodb`

### Installing

1. 安裝此python專案所需要的套件：`pip install -r requirements.txt`(因為需要額外安裝pymongo及jieba等等套件)

## Running & Testing

## Run

1. 第一次的時候，需要先初始化資料庫：`python migrate`
2. Execute : `python manage.py runserver`.
3. 建立搜尋引擎的key： `/search/InvertedIndex`  
此步驟需要連接mongodb，所以請確保mongodb的service是start的狀態，然後可以去休息一下，因為要建立約15分鐘

### Break down into end to end tests

目前還沒寫測試...

### And coding style tests

目前沒有coding style tests...

## Deployment

There is no difference between other Django project

You can deploy it with uwsgi, gunicorn or other choice as you want

`搜尋引擎` 是一般的django專案，所以他佈署的方式並沒有不同

## Built With

* python3.5
* Django==1.10.4
* mongodb==3.2.11
* pymongo==3.4.0


## Versioning

For the versions available, see the [tags on this repository](https://github.com/david30907d/KCM/releases).

## Contributors

* **張泰瑋** [david](https://github.com/david30907d)

## License

## Acknowledgments
感謝`范耀中`老師的指導
