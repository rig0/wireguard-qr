# Wireguard-QR

A self hosted QR code generator for wireguard configuartions. I'm aware of online solutions but I wanted something simple that I could self host. You just never know where your keys might end up when using public websites. This app is intended to run locally preferably behind a reverse proxy. 


# Features

#### Create QR code from new config

![Form](https://i.imgur.com/ZTQfy8L.png)

![QR Code](https://i.imgur.com/PdVuMtY.png)


#### Wireguard key generator

![Key Generator](https://i.imgur.com/pl9FjOe.png)


#### Create QR code from file

![File Upload](https://i.imgur.com/b0SDPTP.png)

# Setup

### Option 1: Docker Compose (latest release)
![Docker Registry Status](https://status.nex.io/api/badge/34/status?style=for-the-badge) ![Docker Registry Uptime](https://status.nex.io/api/badge/34/uptime?style=for-the-badge)

```yaml
version: "3"
services:
  wireguard-qr:
    container_name: wireguard-qr
    image: dock.rigslab.com/wireguard-qr:latest
    restart: always
    user: 1000:1000
    ports:
      - 5182:5182
```

### Option 2: Docker Compose (from source)

##### Clone repo
```bash
git clone https://rigslab.com/Rambo/Wireguard-QR.git
```

##### Go to directory
```bash
cd ./Wireguard-QR
```

##### Build docker image
```bash
docker-compose up -d
```


### Option 3: Node.js (from source)

##### Install dependancies
```bash
sudo apt update && sudo apt dist-upgrade -y && sudo apt install nodejs npm git -y
```

##### Clone repo
```bash
git clone https://rigslab.com/Rambo/Wireguard-QR.git
```

##### Go to directory
```bash
cd ./Wireguard-QR
```

##### Install
```bash
npm install
```

##### Run app
```bash
node app.js
```

## Behaviour
- Treats Private Keys and PreShared Keys as sensitive passwords so they aren't shown in the interface and aren't saved by the browser.
- Clears all forms after creating QR code
- Clears all forms on page refresh
- No confgurations or QR codes are saved/logged either client side or server side

## To Do:
- Validate configs before creating QR code
- Option to download created config?
