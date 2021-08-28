FROM node:alpine
WORKDIR /app
COPY ./package.json ./
# RUN yarn install --production true
# OR
# RUN yarn install --prod= true
# COPY ./node_modules ./
COPY ./ ./
CMD ["yarn","start"]