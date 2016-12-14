# 搜尋引擎（Search Engine）

選課小幫手搜尋引擎
使用KCM、KEM等輔助工具
當使用者所搜尋的名稱查無結果時
回傳系統`推測的相關課程並推荐給使用者`

### API usage and Results

API使用方式（下面所寫的是api的URL pattern）  
(Usage of API (pattern written below is URL pattern))：

1. 取得課程在資料庫的id (Get id of database by Course Name. Query with abbreviation is allowed. Put the Course Name you want to query after `/?keyword=`)： `/search?keyword={課程名稱, CourseName}&school={學校名稱, School Name}`
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

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisities

1. OS：Ubuntu / OSX would be nice
2. environment：need python3
  * Linux：`sudo apt-get update; sudo apt-get install; python3 python3-dev`
  * OSX：`brew install python3`

<!-- ### Installing

1. `git clone https://github.com/Stufinite/time2eat.git`
2. 使用虛擬環境：
  1. 創建一個虛擬環境：`virtualenv venv`
  2. 啟動方法
    1. for Linux：`. venv/bin/activate`
    2. for Windows：`venv\Scripts\activate`
3. `pip install -r requirements.txt` -->

## Running & Testing

## Run

1. 第一次的時候，需要先初始化資料庫：`python migrate`
2. Execute : `python manage.py runserver`. If it work fine on [here](127.0.0.1:8000) , then it's done. Congratulations~~

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
