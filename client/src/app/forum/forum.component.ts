import { Component, OnInit, OnDestroy, ElementRef, AfterViewInit } from '@angular/core';
import { Tag } from './tag.component';
import { DatePipe } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';

export interface Date {
  date: string;
  time: string;
}

@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.scss'],
  providers: [DatePipe],
})
export class ForumComponent {
  showPost = false;
  addNewPost = false;
  selectedPost: Tag;
  titleDefaultValue: string;
  messageDefaultValue: string;
  isAdmin: boolean;
  constructor(private elementRef: ElementRef, private datePipe: DatePipe, private authService: AuthService) {
    this.isAdmin = this.authService.getIsAdmin();
  }

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '15rem',
    minHeight: '5rem',
    maxHeight: '50rem',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    toolbarHiddenButtons: [],
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'comic-sans-ms', name: 'Comic Sans MS' },
    ],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText',
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
  };

  tags: Array<Tag> = [
    {
      content: 'asd asd asd',
      title: 'Eli-post',
      author: 'eli',
      date: { date: '10/1/2020', time: '10:30' },
      onEditTagMode: false,
      comments: [
        {
          content: 'eli piho',
          title: 'Ofek-Comment',
          author: 'Ofek',
          comments: [],
          date: { date: '10/11/2020', time: '10:00' },
          onEditTagMode: false,
        },
        {
          content: 'eli gever',
          title: 'lidor-Comment',
          author: 'Lidor',
          comments: [],
          date: { date: '10/12/2020', time: '2:30' },
          onEditTagMode: false,
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
      onEditTagMode: false,
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

  onDeletePostClick(post) {
    const index: number = this.tags.indexOf(post);
    if (index !== -1) {
      this.tags.splice(index, 1);
    }
  }

  onDeleteCommentClick(comment) {
    const index: number = this.selectedPost.comments.indexOf(comment);
    if (index !== -1) {
      this.selectedPost.comments.splice(index, 1);
    }
  }

  onEditPostClick(post) {
    const index: number = this.tags.indexOf(post);
    this.tags[index].onEditTagMode = true;
  }

  onEditCommentClick(comment) {
    const index: number = this.selectedPost.comments.indexOf(comment);
    this.selectedPost.comments[index].onEditTagMode = true;
  }

  onSubmitEditMessage(post, title: string, message: string) {
    const index: number = this.tags.indexOf(post);
    this.tags[index].title = title;
    this.tags[index].content = message;
    this.tags[index].onEditTagMode = false;
  }

  onSubmitEditComment(comment, title: string, message: string) {
    const index: number = this.selectedPost.comments.indexOf(comment);
    this.selectedPost.comments[index].title = title;
    this.selectedPost.comments[index].content = message;
    this.selectedPost.comments[index].onEditTagMode = false;
  }
}
