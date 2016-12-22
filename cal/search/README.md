# 搜尋引擎（Search Engine）

選課小幫手搜尋引擎 使用KCM、KEM等輔助工具 當使用者所搜尋的名稱查無結果時 回傳系統`推測的相關課程並推荐給使用者`

## API usage and Results

API使用方式（下面所寫的是api的URL pattern）<br>
(Usage of API (pattern written below is URL pattern))：

1. 簡稱、課程名稱、老師、課號搜尋：取得課程在資料庫的id (Get id of database by Course Name. Query with abbreviation is allowed. Put the Course Name you want to query after `/?keyword=`)： `/search?keyword={課程名稱、老師名稱、課程id, CourseName, Professor, CourseID}&school={學校名稱, School Name}`

  - 範例 (Example)：`/search/?keyword=計概&school=NCHU`
  - result：

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

2. 關鍵字查詢：`西方電影文學` 可以用 `歐美` `電影` 這樣的複數關鍵字去查詢，因為找不到同時符合`歐美`和`電影`的課程，所以這時會啟動`kem`去將所有的關鍵字找出同義詞。`歐美`=>`西方`，所以`西方`和`電影`的交集就可以查到`西方電影文學`

  - 範例 (Example)：`/search/?keyword=電影+西方&school=NCHU`
  - result：

    ```
    [{"DBid": 1805, "weight": 0}]
    ```

3. 累積關鍵字權重：需要給使用者查詢了哪個`關鍵字`、`課程代碼`、`學校`。例如`普物`這個key在mongodb裏面有非常多堂課程，透過指定`課程代碼`累積權重，下次使用者查詢時，權重高的課程會優先出現。

  - 範例 (Example)：`incWeight/?keyword=普物&code=1108&school=NCHU`
  - result：

    ```
    {
    "_id": "58562b5caaa5b630c0c70e76",
    "普物": {
    "NCHU": [
    {
      "DBid": 2349,
      "weight": 55575
    },
    {
      "DBid": 2433,
      "weight": 700
    },
    {
      "DBid": 2434,
      "weight": 300
    }
    ]
    },
    "NCHUCourseID": [
    "1108",
    "2277"
    ]
    }
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
3. 建立搜尋引擎的key： `/search/InvertedIndex`<br>
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
