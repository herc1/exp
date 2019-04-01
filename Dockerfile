FROM python:3.7-stretch

RUN pip install flask Flask-Sqlalchemy pymysql Flask-BasicAuth

WORKDIR /opt

EXPOSE 5000

CMD ["/opt/exp/exp.py"]