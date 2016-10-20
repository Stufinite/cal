from django.db import models
from datetime import datetime


class Course(models.Model):
    courseID = models.CharField(max_length=10)
    name = models.CharField(max_length=15)
    book = models.CharField(max_length=50)
    create = models.DateTimeField()

    def __str__(self):
        return self.name

    def check_courseID_and_name_not_empty(self):
        return (self.courseID != None and self.courseID != "") and (self.name != None and self.name != "")


class Course_of_user(models.Model):
    user_name = models.CharField(max_length=50)
    user_dept = models.CharField(max_length=20)
    user_grade = models.DecimalField(
        default=1, max_digits=1, decimal_places=0)  # always add default value!
    time_table = models.CharField(max_length=5000)
    idList = models.ManyToManyField(Course)
    returnarr = models.CharField(max_length=100)
    hadSaved = models.BooleanField(default=False)  # 表示是否有使用過小幫手，因為只要有用過就會強制他儲存
    create = models.DateTimeField()

    def __str__(self):
        return self.user_name
