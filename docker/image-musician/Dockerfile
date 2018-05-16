FROM node:4.3.1
MAINTAINER Nathan Fluckiger <nathan.fluckiger@heig-vd.ch>


COPY src /opt/app/

WORKDIR /opt/app/
RUN ["npm","install","uuid","--save"]

ENTRYPOINT ["node", "/opt/app/musician.js"]