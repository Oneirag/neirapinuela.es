import socket
import json
from .pam_server import PORT


def send_request(username, password, service=None):
    request_data = {'username': username, 'password': password, 'service': service}
    json_data = json.dumps(request_data).encode()

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect(('localhost', PORT))
        s.sendall(json_data + b'\n')  # Sending data followed by newline character
        s.shutdown(socket.SHUT_WR)  # Closing the write end of the socket
        response = s.recv(1024).decode().strip()

    return response


def check_password(username: str, password: str, service="web") -> bool:
    retval = send_request(username, password, service)
    return retval == "1"


def main():
    username = input("Enter username: ")
    password = input("Enter password: ")
    service = input("Enter service (optional): ")

    result = send_request(username, password, service)
    print("Authentication result:", "Success" if result == '1' else "Failure")


if __name__ == '__main__':
    while True:
        main()
