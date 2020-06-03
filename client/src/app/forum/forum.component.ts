import { Component, OnInit, OnDestroy, ElementRef, AfterViewInit } from '@angular/core';
import { Tag } from './tag.component';
import { DatePipe } from '@angular/common';
import { AuthService } from '../auth/auth.service';

export interface Date {
  date: string;
  time: string;
}

@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css'],
  providers: [DatePipe],
})
export class ForumComponent {
  showPost = false;
  addNewPost = false;
  selectedPost: Tag;
  titleDefaultValue: string;
  messageDefaultValue: string;
  constructor(private elementRef: ElementRef, private datePipe: DatePipe, private authService: AuthService) {}

  text = 'asdas \n asdas \nasdas \nasdas \nasdas \n';
  tags: Array<Tag> = [
    {
      content: this.text,
      title: 'Eli-post',
      author: 'eli',
      date: { date: '10/1/2020', time: '10:30' },
      comments: [
        {
          content: 'eli piho',
          title: 'Ofek-Comment',
          author: 'Ofek',
          comments: [],
          date: { date: '10/11/2020', time: '10:00' },
        },
        {
          content: 'eli gever',
          title: 'lidor-Comment',
          author: 'Lidor',
          comments: [],
          date: { date: '10/12/2020', time: '2:30' },
        },
      ],
    },
  ];

  onPostClick(post) {
    this.showPost = !this.showPost;
    this.selectedPost = post;
  }

  onSubmitMessage(title: string, message: string, type: string) {
    // get author from user name
    const author = this.authService.getUsername();
    const myDate = new Date();
    const date = {
      date: this.datePipe.transform(myDate, 'dd/MM/yy'),
      time: myDate.getHours() + ':' + myDate.getMinutes(),
    };
    const tagToAdd: Tag = {
      title,
      content: message,
      author,
      date,
      comments: [],
    };
    if (type === 'Comment') {
      this.selectedPost.comments.push(tagToAdd);
    } else {
      this.tags.push(tagToAdd);
      this.addNewPost = !this.addNewPost;
    }
    this.titleDefaultValue = '';
    this.messageDefaultValue = '';
  }

  onAddNewPostClick() {
    this.addNewPost = !this.addNewPost;
  }
}
