# Main camera app
#
import os
import logging
import lib.cloudstorage as cloudstorage
import hashlib

from flask import Flask, render_template, jsonify, session, flash, request, abort, redirect
from datetime import datetime

BUCKET_NAME   = os.getenv("BUCKET_NAME")
PASSWORD      = os.getenv("PASSWORD")
SECRET_COOKIE = hashlib.md5(PASSWORD).hexdigest()

#logging.setLevel(logging.DEBUG)
app = Flask(__name__)
app.secret_key = os.urandom(12)

@app.before_request
def force_https():
    if request.endpoint in app.view_functions and not request.is_secure:
        return redirect(request.url.replace('http://', 'https://'))

@app.route('/')
def index():
    # Check authentication
    if not session.get('loggedin') == SECRET_COOKIE:
        return render_template('login.html')
    else:
        return render_template("index.html")

@app.route('/login', methods=['POST'])
def login():
    if request.form['password'] == PASSWORD:
        session.permanent = True
        session['loggedin'] = SECRET_COOKIE
    else:
        flash('Wrong password!')
    return redirect('/')

@app.route('/logout')
def logout():
    session['loggedin'] = False
    return index()

@app.route('/images')
@app.route('/images/<date>')
def images(date=None):
    if date is None:
        today = datetime.now().strftime("%Y%m%d")
        prefix = "snap-" + today
    else:
        prefix = "snap-" + date

    path = '/' + BUCKET_NAME + '/' + prefix

    files = []
    stats = cloudstorage.listbucket(path)
    for stat in stats:
        files.append(stat.filename.split('/')[2])

    logging.debug(files)
    return jsonify(files)

@app.errorhandler(500)
def server_error(e):
    # Log the error and stacktrace.
    logging.exception('An error occurred during a request.')
    return 'An internal error occurred.', 500

