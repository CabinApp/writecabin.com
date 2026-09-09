"""Preview the static site with GitHub Pages-style custom 404 responses."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from functools import partial
import argparse
ROOT=Path(__file__).resolve().parents[1]
class Handler(SimpleHTTPRequestHandler):
    def send_error(self,code,message=None,explain=None):
        if code!=404:
            return super().send_error(code,message,explain)
        content=(ROOT/'404.html').read_bytes()
        self.send_response(404)
        self.send_header('Content-Type','text/html; charset=utf-8')
        self.send_header('Content-Length',str(len(content)))
        self.end_headers()
        if self.command!='HEAD':self.wfile.write(content)
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8766);args=parser.parse_args()
    ThreadingHTTPServer(('127.0.0.1',args.port),partial(Handler,directory=str(ROOT))).serve_forever()
