# Handle incoming mail.
# Find attachments of type "image", save it to Google storage
#
import os
import logging
import re
from datetime import datetime
from datetime import timedelta
from pprint import pprint

import lib.cloudstorage as cloudstorage
from google.appengine.ext.webapp.mail_handlers import InboundMailHandler
import webapp2

BUCKET_NAME = os.getenv('BUCKET_NAME')
MAIL_SENDER = os.getenv('MAIL_SENDER')

class MailHandler(InboundMailHandler):

    def receive(self, mail_message):

        if MAIL_SENDER not in mail_message.sender:
            logging.error("Received mail from wrong sender:")
            logging.error("From: " + mail_message.sender)
            logging.error("To: " + mail_message.to)
            logging.error("Subject: " + mail_message.subject)
            return

        pattern = re.compile('Snap_(\d+)-(\d+)-(\d+).jpg')
        if hasattr(mail_message, 'attachments'):
            for attachment in mail_message.attachments:

                try:
                    # fetch the filename and the attachment payload
                    filename, payload = attachment

                    # fix the filename
                    # Snap_20180215-200050-2.jpg => snap-201815-200052.jpg
                    logging.debug(filename)
                    m = pattern.match(filename)
                    time = datetime.strptime(m.group(2), "%H%M%S") + timedelta(seconds=int(m.group(3)))
                    filename = "snap-" + m.group(1) + "-" + datetime.strftime(time, "%H%M%S") + ".jpg"

                    # write image to bucket
                    logging.debug("writing <%s> to cloudstorage", filename)
                    image = payload.decode()
                    fullpath = '/' + BUCKET_NAME + '/' + filename
                    with cloudstorage.open( fullpath, 'w', content_type='image/jpg') as cs_file:
                        cs_file.write(image)
                        cs_file.close()
                except:
                    logging.error("Error handling attachment [%s]", attachment)

# WebApplication entry point
app = webapp2.WSGIApplication([MailHandler.mapping()], debug=True)

