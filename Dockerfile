# NOT MAINTAINED! only stays here for potential later readaption
FROM ubuntu
MAINTAINER Jannis jannismax@gmail.com

ENV DEBIAN_FRONTEND=noninteractive 
# install necessary packages
RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
	make \
	git \
	npm \
	sqlite3 \
	&& mkdir -p /freeidea

WORKDIR /freeidea

ADD . /freeidea

RUN npm ci \
	&& npm audit fix 

EXPOSE 8081

CMD node myServer.js
