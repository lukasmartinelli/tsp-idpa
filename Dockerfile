FROM node:0.12-onbuild
RUN npm install -g grunt
EXPOSE 8080
CMD [ "grunt" ]
