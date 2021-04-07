# DA Information Jitsi Meet
#### Create Project : 2020-07-16 14:20..

* * *

## Guide
* **Jitsi Meet Development environment**
    + OS(Ubuntu) : 18.04.4 (18.04==)
    + Maximum disk size (GB) : 80.0
    + node : 12.18.2 (12=<)  
    + npm : 6.14.5 (6=<)

* **Jitsi Meet Install**
    1. 인증서 생성 (.csr 서면 요청, .key 개인 키, .crt 인증서)
    <pre>
    <code>
    cd /etc/ssl
    openssl req -new -newkey rsa:2048 -nodes -keyout {도메인명}.key -out {도메인명}.csr
    openssl x509 -req -days 365 -in {도메인명}.csr -signkey {도메인명}.key -out {도메인명}.crt (공식 인증서 X)
    </code>
    </pre>
    
    2. apt update
    <pre>
    <code>
    apt update  
    apt install apt-transport-https
    apt-add-repository universe (이미 설치죄어있다는 상태메시지 뜸)
    apt update
    </code>
    </pre>
    3. 도메인 설정
    <pre>
    <code>
    sudo hostnamectl set-hostname {도메인명} (cat /etc/hostname 으로 확인)
    vi /etc/hosts 
    127.0.0.1 localhost {도메인명} (ping {도메인명} 으로 확인)
    </code>
    </pre>
    4. Jitsi 패키지 저장소 추가
    <pre>
    <code>
    curl https://download.jitsi.org/jitsi-key.gpg.key | sudo sh -c 'gpg --dearmor > /usr/share/keyrings/jitsi-keyring.gpg'
    echo 'deb [signed-by=/usr/share/keyrings/jitsi-keyring.gpg] https://download.jitsi.org stable/' | sudo tee /etc/apt/sources.list.d/jitsi-stable.list > /dev/null
    apt update
    </code>
    </pre>
    5. 방화벽 설정 구성
    <pre>
    <code>
    sudo ufw allow 80/tcp (SSL 인증서 확인 / 갱신)
    sudo ufw allow 443/tcp (jitsi meet에 대한 일반 엑세스)
    sudo ufw allow 4443/tcp (fallback 네트워크 비디오 / 오디오 통신용)
    sudo ufw allow 10000/udp (일반 네트워크 비디오 / 오디오 통신용)
    sudo ufw allow 22/tcp (SSH를 사용하여 서버에 액세스하는 경우)
    sudo ufw enable (y 입력)
    sudo ufw status verbose (방화벽 상태 확인)
    </code>
    </pre>
    6. Jistsi Meet 설치
    <code>
    <pre>
    sudo apt install jitsi-meet (y 입력 -> {도메인명} 입력 -> 첫번째 선택)
    </pre>
    <code>

    


