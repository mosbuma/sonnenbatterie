# set correct rights for node-red data folder

mkdir data
chmod -R 777 data
chown -R 1000:1000 data

#node red flow
node red basic flow has been imported
parameters need to be set: https://github.com/tallestxxl/node-red?tab=readme-ov-file

#start

cd to the root folder
````docker compose up````

#edits

after editing the server or client 
````docker compose up --build````