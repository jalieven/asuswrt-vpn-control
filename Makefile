start_local:
	cd webapp; npm run build; cd ..; node index.js

build_docker:
	cd webapp; npm run build; cd ..; docker build --tag asuswrt-vpn-control:latest .

run_docker:
	docker run -p 4444:4444 asuswrt-vpn-control:latest

start_docker: build_docker run_docker