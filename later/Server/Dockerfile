FROM python:3
WORKDIR /usr/src
COPY . ./
RUN pip install --no-cache-dir -r requirements.txt
ENV SERVER_PORT=4051
ENV NODE_ENV=production
EXPOSE 4051
CMD ["hypercorn", "-k", "trio", "Server:app", "--bind", "0.0.0.0:4051"]
