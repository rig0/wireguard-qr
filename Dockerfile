# Use an official Node.js runtime based on Alpine for a lighter image
FROM node:20-alpine

# Install glibc on Alpine to support native dependencies requiring it
RUN wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub
RUN wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.35-r0/glibc-2.35-r0.apk
RUN wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.35-r0/glibc-bin-2.35-r0.apk
RUN apk --no-cache --force-overwrite add glibc-2.35-r0.apk glibc-bin-2.35-r0.apk
RUN ls -al /lib64/ld-linux-x86-64.so.2

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port on which the app will run
EXPOSE 5182

# Command to run the application
CMD ["node", "app.js"]
