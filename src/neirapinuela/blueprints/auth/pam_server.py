#!/usr/bin/env python3

import asyncio
import json
import pam

PORT = 8317


async def handle_client(reader, writer):
    data = await reader.readline()
    try:
        json_data = json.loads(data.decode())
        username = json_data.get('username')
        password = json_data.get('password')
        service = json_data.get('service')

        if username and password:
            if service:
                auth_result = pam.authenticate(username, password, service)
            else:
                auth_result = pam.authenticate(username, password)

            if auth_result:
                writer.write(b'1\n')
            else:
                writer.write(b'0\n')
        else:
            writer.write(b'0\n')

        await writer.drain()
        writer.close()
    except json.JSONDecodeError:
        writer.write(b'0\n')
        await writer.drain()
        writer.close()


async def main():
    server = await asyncio.start_server(
        handle_client, 'localhost', PORT
    )

    async with server:
        await server.serve_forever()


if __name__ == '__main__':
    print(f"Started pam server in port {PORT}")
    asyncio.run(main())
