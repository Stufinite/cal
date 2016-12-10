from django.db import models


class Department(models.Model):
    degree = models.CharField(max_length=100, default='')
    code = models.CharField(max_length=100, default='')
    title = models.CharField(max_length=100, default='')

    def __str__(self):
        return '{} {}'.format(self.code, self.title)


class Course(models.Model):
    school = models.CharField(max_length=100, default='')
    semester = models.CharField(max_length=100, default='')
    code = models.CharField(max_length=100, default='')
    for_class = time = models.CharField(max_length=100, default='')
    credits = models.IntegerField(default=1)
    title = models.CharField(max_length=100, default='')
    department = models.CharField(max_length=100, default='')
    professor = models.CharField(max_length=100, default='')
    time = models.CharField(max_length=100, default='')
    location = models.CharField(max_length=100, default='')
    obligatory = models.BooleanField(default=True)
    language = models.CharField(max_length=100, default='')
    duration = models.CharField(max_length=100, default='')
    prerequisite = models.CharField(max_length=100, default='')
    note = models.CharField(max_length=100, default='')

    def __str__(self):
        return '{}: {} / {}'.format(self.semester, self.title, self.professor)


class SelectedCourse(models.Model):
    user = models.CharField(max_length=20, default='')
    course = models.ForeignKey(Course, null=True)

    def __str__(self):
        return '{}: {}'.format(self.user, self.course.title)
