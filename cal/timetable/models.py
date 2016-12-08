from django.db import models


class Department(models.Model):
    code = models.CharField(max_length=100, default='')
    title = models.CharField(max_length=100, default='')


class Course(models.Model):
    semester = models.CharField(max_length=100, default='')
    code = models.CharField(max_length=100, default='')
    for_class = time = models.CharField(max_length=100, default='')
    credits = models.CharField(max_length=100, default='')
    title = models.CharField(max_length=100, default='')
    department = models.CharField(max_length=100, default='')
    professor = models.CharField(max_length=100, default='')
    time = models.CharField(max_length=100, default='')
    location = models.CharField(max_length=100, default='')
    obligatory = models.CharField(max_length=100, default='')
    language = models.CharField(max_length=100, default='')
    duration = models.CharField(max_length=100, default='')
    prerequisite = models.CharField(max_length=100, default='')
    note = models.CharField(max_length=100, default='')


class SelectedCourse(models.Model):
    user = models.CharField(max_length=20, default='')
    course = models.ForeignKey(Course, null=True)
