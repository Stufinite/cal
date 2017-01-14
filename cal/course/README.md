# 課程資料查詢API (API of Course code of Dept. and Time of Course)

此API可以直接查詢`系所的課程代碼`和`課程的上課時間`

## API usage and Results

API使用方式（下面所寫的是api的URL pattern）<br>
(Usage of API (pattern written below is URL pattern))：

1. 取得系所的課程代碼<br>
  (Get Course code of Dept Name.)：<br>
  `/course/CourseOfDept/?dept=<department code>&grade=<your grade>&school=<school>`

  - 範例 (Example)：`/course/CourseOfDept/?dept=U56&grade=3&school=NCHU`
  - result：

    ```
    {
      "course": {
        "optional": {
          "3": ["3105","3110","3117","3185","3198","3314","3364"]
        },
        "obligatory": {
          "3": ["3359","3360","3365","3366","3367","3368","3369","3370","3371","3372"]
        }
      }
    }
    ```

2. 查詢該時段有什麼課可以上：<br>
  需要指定哪一天的哪一節課 `/course/TimeOfCourse/?day=<星期幾>&time=<第幾節課>&school=<學校名稱>`

  - 範例 (Example)：`/course/TimeOfCourse/?day=1&time=1&school=NCHU`
  - result：

    ```
    ["1159", "2217", "3432", "3434", "3445", "3447", "3448", "3449", "3450", "3451", "3452", "3453", "3456", "3457", "3458", "3459", "3460", "3461"]
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
