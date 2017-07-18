FROM library/python:3.5
MAINTAINER Borogin Gregory <grihabor@mail.ru>

WORKDIR /root

COPY requirements.txt .
RUN pip3 install -r requirements.txt

