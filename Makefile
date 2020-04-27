start_local:
	cd webapp; npm run build; cd ..; node index.js

build_docker:
	cd webapp; npm run build; cd ..; docker build --tag asuswrt-vpn-control:1.0.2 .

run_docker:
	docker run -d -p 4444:4444 -v /Users/janlievens/.ssh/asus_wrt_rsa:/usr/src/app/asuswrt_rsa asuswrt-vpn-control:1.0.2

start_docker: build_docker run_docker

release_docker:
	 docker tag asuswrt-vpn-control:1.0.2 jalieven/asuswrt-vpn-control:1.0.2
	 docker push jalieven/asuswrt-vpn-control:1.0.2