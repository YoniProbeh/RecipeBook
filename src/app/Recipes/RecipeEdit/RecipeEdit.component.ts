import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { RecipeService } from '../Recipe.service';
import { Recipe } from '../Recipe';

@Component({
  selector: 'app-RecipeEdit',
  templateUrl: './RecipeEdit.component.html',
  styleUrls: ['./RecipeEdit.component.css']
})
export class RecipeEditComponent implements OnInit {
  public id: number;
  public editMode: boolean = false;
  public recipeForm: FormGroup;

  constructor(private route: ActivatedRoute, private router: Router, private recipeService: RecipeService) { }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.id = parseInt(params['id']);
      this.editMode = params['id'] != null;
      this.initForm();
    });
  }

  public onSubmit() {
    const newRecipe = new Recipe(
      this.recipeForm.value['name'],
      this.recipeForm.value['description'],
      this.recipeForm.value['imagePath'],
      this.recipeForm.value['ingredients']);

    if (this.editMode) {
      this.recipeService.updateRecipe(this.id, newRecipe);
    }
    else {
      this.recipeService.addRecipe(newRecipe);
    }

    this.onCancel();
  }

  public onAddIngredient() {
    (<FormArray>this.recipeForm.get('ingredients')).push(
      new FormGroup({
        'name': new FormControl(null, Validators.required),
        'amount': new FormControl(null, [
          Validators.required,
          Validators.pattern(/^[1-9]+[0-9]*$/)
        ])
      })
    );
  }

  private initForm() {
    let recipeName: string;
    let recipeImagePath: string;
    let recipeDescription: string;
    let recipeIngredients = new FormArray([]);

    if (this.editMode) {
      const recipe = this.recipeService.getRecipe(this.id);
      recipeName = recipe.name;
      recipeImagePath = recipe.imagePath;
      recipeDescription = recipe.description;
      
      if (recipe['ingredients']) {
        for (let ingredient of recipe.ingredients) {
          recipeIngredients.push(
            new FormGroup({
              'name': new FormControl(ingredient.name, Validators.required),
              'amount': new FormControl(ingredient.amount, [
                Validators.required,
                Validators.pattern(/^[1-9]+[0-9]*$/)
              ])
            })
          );
        }
      }
    }

    this.recipeForm = new FormGroup({
      'name': new FormControl(recipeName, Validators.required),
      'imagePath': new FormControl(recipeImagePath, Validators.required),
      'description': new FormControl(recipeDescription, Validators.required),
      'ingredients': recipeIngredients
    });
  }

  public onCancel() {
    this.router.navigate(['../'], { relativeTo: this.route });;
  }
  public onDelete(id: number) {
    (<FormArray>this.recipeForm.get('ingredients')).removeAt(id);
  }
}
